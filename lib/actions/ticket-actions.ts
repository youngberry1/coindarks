"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getTicketStats() {
    try {
        const { count: total, error: totalError } = await supabaseAdmin
            .from('support_tickets')
            .select('*', { count: 'exact', head: true });

        const { count: open, error: openError } = await supabaseAdmin
            .from('support_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'OPEN');

        const { count: closed, error: closedError } = await supabaseAdmin
            .from('support_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'CLOSED');

        if (totalError || openError || closedError) {
            console.error("Error fetching ticket stats:", totalError || openError || closedError);
            return { total: 0, open: 0, closed: 0 };
        }

        return {
            total: total || 0,
            open: open || 0,
            closed: closed || 0
        };
    } catch (error) {
        console.error("Unexpected error fetching ticket stats:", error);
        return { total: 0, open: 0, closed: 0 };
    }
}
