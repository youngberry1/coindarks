"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createTicket(data: {
    subject: string;
    message: string;
    order_id?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('support_tickets')
            .insert({
                user_id: session.user.id,
                order_id: data.order_id,
                subject: data.subject,
                message: data.message,
                status: 'OPEN'
            });

        if (error) throw error;
        revalidatePath("/admin/support");
        return { success: "Ticket submitted successfully! Our team will get back to you soon." };
    } catch {
        return { error: "Failed to submit ticket" };
    }
}

export async function updateTicketStatus(ticketId: string, status: 'OPEN' | 'CLOSED') {
    const session = await auth();
    // Admin check
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('support_tickets')
            .update({ status })
            .eq('id', ticketId);

        if (error) throw error;
        revalidatePath("/admin/support");
        return { success: `Ticket marked as ${status.toLowerCase()}` };
    } catch {
        return { error: "Failed to update ticket status" };
    }
}

export async function getTickets() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return [];

    const { data } = await supabase
        .from('support_tickets')
        .select(`
            *,
            users (
                first_name,
                last_name,
                email
            ),
            orders (
                order_number
            )
        `)
        .order('created_at', { ascending: false });

    return data || [];
}
