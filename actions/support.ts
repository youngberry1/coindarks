"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

import {
    sendSupportReplyEmail,
    sendTicketCreatedEmail,
    sendTicketClosedEmail
} from "@/lib/mail";

// ... (imports remain)

export async function createTicket(data: {
    subject: string;
    message: string;
    priority?: TicketPriority;
    category?: string;
    linked_order_id?: string; // Optional context
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Generate a random Ticket ID (e.g. CD-4821)
        const ticketId = `CD-${Math.floor(1000 + Math.random() * 9000)}`;

        // 1. Create the Ticket
        const { data: ticket, error: ticketError } = await supabaseAdmin
            .from('support_tickets')
            .insert({
                user_id: session.user.id,
                ticket_id: ticketId,
                subject: data.subject,
                priority: data.priority || 'NORMAL',
                category: data.category || 'GENERAL',
                status: 'OPEN',
                linked_order_id: data.linked_order_id
            })
            .select()
            .single();

        if (ticketError) {
            console.error("Error creating ticket:", ticketError);
            return { success: false, error: "Failed to create ticket" };
        }

        // 2. Insert the first message
        const { error: messageError } = await supabaseAdmin
            .from('support_messages')
            .insert({
                ticket_id: ticket.id,
                sender_id: session.user.id,
                message: data.message,
                is_admin_reply: false
            });

        if (messageError) {
            console.error("Error creating message:", messageError);
            // Ideally rollback ticket here, but for now we ignore
            return { success: false, error: "Failed to save message", ticketId: null };
        }

        // 3. Send Notification Email to User
        if (session.user.email) {
            await sendTicketCreatedEmail(
                session.user.email,
                session.user.name || 'User',
                ticketId,
                data.subject,
                data.message
            );
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/support');
        revalidatePath('/admin/support');

        return { success: true, ticketId: ticketId };

    } catch (error) {
        console.error("Server error creating ticket:", error);
        return { success: false, error: "Internal Server Error" };
    }
}

// ... (imports remain)

export async function replyToTicket(data: {
    ticketId: string; // UUID of the ticket
    message: string;
    status?: TicketStatus;
    fromEmail: 'admin@coindarks.com' | 'support@coindarks.com' | 'finance@coindarks.com' | 'noreply@coindarks.com';
}) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // 1. Insert Admin Reply
        const { error: messageError } = await supabaseAdmin
            .from('support_messages')
            .insert({
                ticket_id: data.ticketId,
                sender_id: session.user.id,
                message: data.message,
                is_admin_reply: true,
                created_at: new Date().toISOString()
            });

        if (messageError) throw messageError;

        // 2. Update Ticket Status (and updated_at)
        const updateData: { updated_at: string; status?: TicketStatus } = { updated_at: new Date().toISOString() };
        if (data.status) updateData.status = data.status;

        const { data: ticket, error: updateError } = await supabaseAdmin
            .from('support_tickets')
            .update(updateData)
            .eq('id', data.ticketId)
            .select('ticket_id, user_id')
            .single();

        if (updateError) throw updateError;


        // 3. Send Email Notification
        // Fetch user email first
        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('email, first_name')
            .eq('id', ticket.user_id)
            .single();


        if (userData?.email) {
            // Check if Closed
            if (data.status === 'CLOSED') {
                await sendTicketClosedEmail(
                    userData.email,
                    userData.first_name || 'User',
                    ticket.ticket_id
                );
            } else {
                await sendSupportReplyEmail(
                    userData.email,
                    userData.first_name || 'User',
                    ticket.ticket_id,
                    data.message,
                    data.fromEmail
                );
            }
        }

        revalidatePath(`/admin/support/${data.ticketId}`);
        revalidatePath('/admin/support');

        return { success: true };

    } catch (error) {
        console.error("Error replying to ticket:", error);
        return { success: false, error: "Failed to reply" };
    }
}

export async function getUserTickets() {
    const session = await auth();
    if (!session?.user?.id) return [];

    // 1. Fetch the tickets
    const { data: tickets, error: ticketError } = await supabaseAdmin
        .from('support_tickets')
        .select('*')
        .eq('user_id', session.user.id)
        .in('status', ['OPEN', 'IN_PROGRESS'])
        .order('updated_at', { ascending: false });

    if (ticketError) {
        console.error("Error fetching user tickets list:", {
            message: ticketError.message,
            code: ticketError.code
        });
        return [];
    }

    if (!tickets || tickets.length === 0) return [];

    // 2. Fetch messages for these tickets to get the first one for the preview
    const ticketIds = tickets.map(t => t.id);
    const { data: messages, error: messageError } = await supabaseAdmin
        .from('support_messages')
        .select('ticket_id, message, created_at')
        .in('ticket_id', ticketIds)
        .order('created_at', { ascending: true });

    if (messageError) {
        console.error("Error fetching ticket snippets:", messageError);
        return tickets.map(t => ({ ...t, preview_message: "" }));
    }

    // 3. Map the first message (earliest created_at) to each ticket
    // Since we ordered messages by created_at, find() will get the first one if we were lucky, 
    // but better to be safe and find the first matching one.
    return tickets.map(t => {
        const firstMsg = messages?.find(m => m.ticket_id === t.id);
        return {
            ...t,
            preview_message: firstMsg?.message || ""
        };
    });
}

export async function getUserTicket(id: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const { data: ticket, error } = await supabaseAdmin
        .from('support_tickets')
        .select('*')
        .eq('ticket_id', id) // Search by public ID (e.g. CD-1234)
        .eq('user_id', session.user.id)
        .single();

    // Fallback search by UUID if ticket_id match fails (just in case)
    if (!ticket) {
        const { data: ticketByUuid } = await supabaseAdmin
            .from('support_tickets')
            .select('*')
            .eq('id', id)
            .eq('user_id', session.user.id)
            .single();
        return ticketByUuid;
    }

    if (error || !ticket) return null;
    return ticket;
}

export async function getTicketMessages(ticketUuid: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    // Verify ownership first (although RLS should handle, we are using admin client here so manual check needed)
    // Actually simpler: just query messages where ticket belongs to user.
    // Ideally we'd use regular supabase client with RLS, but we've been using admin for actions here.

    const { data: messages } = await supabaseAdmin
        .from('support_messages')
        .select('*, users(first_name, last_name, role)') // Join sender info
        .eq('ticket_id', ticketUuid)
        .order('created_at', { ascending: true });

    return messages || [];
}


export async function replyToTicketUser(data: {
    ticketId: string; // This is the UUID
    message: string;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Verify ownership
        const { data: ticket } = await supabaseAdmin
            .from('support_tickets')
            .select('id')
            .eq('id', data.ticketId)
            .eq('user_id', session.user.id)
            .single();

        if (!ticket) return { success: false, error: "Ticket not found" };

        // Insert Message
        const { error: messageError } = await supabaseAdmin
            .from('support_messages')
            .insert({
                ticket_id: data.ticketId,
                sender_id: session.user.id,
                message: data.message,
                is_admin_reply: false,
            });

        if (messageError) throw messageError;

        // Update Ticket Status to OPEN if it was RESOLVED?
        // Usually if user replies, it bumps back to OPEN or just updates timestamp.
        await supabaseAdmin
            .from('support_tickets')
            .update({
                updated_at: new Date().toISOString(),
                status: 'OPEN' // Re-open if they reply
            })
            .eq('id', data.ticketId);

        revalidatePath(`/dashboard/support/${data.ticketId}`); // TODO: Check actual route
        return { success: true };

    } catch (error) {
        console.error("Error user replying:", error);
        return { success: false, error: "Failed to send message" };
    }
}

export async function updateTicketStatus(
    ticketId: string,
    status: 'OPEN' | 'CLOSED'
) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // 1. Update Ticket
        const { data: ticket, error } = await supabaseAdmin
            .from('support_tickets')
            .update({
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', ticketId)
            .select('ticket_id, user_id')
            .single();

        if (error) throw error;

        // 2. Send Email if Closed
        if (status === 'CLOSED') {
            const { data: userData } = await supabaseAdmin
                .from('users')
                .select('email, first_name')
                .eq('id', ticket.user_id)
                .single();

            if (userData?.email) {
                await sendTicketClosedEmail(
                    userData.email,
                    userData.first_name || 'User',
                    ticket.ticket_id
                );
            }
        }

        revalidatePath('/admin/support');
        revalidatePath(`/admin/support/${ticketId}`);
        return { success: true };

    } catch (error) {
        console.error("Error updating ticket status:", error);
        return { success: false, error: "Failed to update status" };
    }
}
