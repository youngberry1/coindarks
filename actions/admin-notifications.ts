"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type NotificationEvent = {
    type: 'ORDER' | 'KYC';
    id: string;
    title: string;
    description: string;
    created_at: string;
};

export async function checkNewNotifications(lastCheckTime: string) {
    const session = await auth();

    // 1. Strict Auth Check
    if (!session || !session.user || session.user.role !== "ADMIN") {
        return { events: [], serverTime: new Date().toISOString() };
    }

    const events: NotificationEvent[] = [];
    const now = new Date();
    // Add small buffer to avoid missed milliseconds, but client handles overlap
    const checkTime = new Date(lastCheckTime);

    try {
        // 2. Check for New Orders
        const { data: orders } = await supabaseAdmin
            .from('orders')
            .select('id, order_number, asset, created_at')
            .gt('created_at', checkTime.toISOString())
            .order('created_at', { ascending: true });

        if (orders) {
            orders.forEach(order => {
                events.push({
                    type: 'ORDER',
                    id: order.id,
                    title: "New Order Received",
                    description: `Order #${order.order_number} (${order.asset}) is pending review.`,
                    created_at: order.created_at
                });
            });
        }

        // 3. Check for New KYC Submissions
        const { data: kycs } = await supabaseAdmin
            .from('kyc_submissions')
            .select('id, created_at')
            .gt('created_at', checkTime.toISOString())
            .order('created_at', { ascending: true });

        if (kycs) {
            kycs.forEach(kyc => {
                events.push({
                    type: 'KYC',
                    id: kyc.id,
                    title: "New KYC Submission",
                    description: "A user has submitted documents for verification.",
                    created_at: kyc.created_at
                });
            });
        }

        return {
            events,
            serverTime: now.toISOString()
        };

    } catch (error) {
        console.error("Failed to check admin notifications:", error);
        return { events: [], serverTime: now.toISOString() };
    }
}
