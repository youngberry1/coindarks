"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';





import { sendSupportReplyEmail, sendTicketCreatedEmail } from "@/lib/mail";

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
    fromEmail: 'admin@coindarks.com' | 'support@coindarks.com' | 'finance@coindarks.com';
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
            await sendSupportReplyEmail(
                userData.email,
                userData.first_name || 'User',
                ticket.ticket_id,
                data.message,
                data.fromEmail
            );
        }

        revalidatePath(`/admin/support/${data.ticketId}`);
        revalidatePath('/admin/support');

        return { success: true };

    } catch (error) {
        console.error("Error replying to ticket:", error);
        return { success: false, error: "Failed to reply" };
    }
}
