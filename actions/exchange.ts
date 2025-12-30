"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Generate unique order number CD-XXXX
function generateOrderNumber() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `CD-${result}`;
}

export async function createOrder(data: {
    type: 'BUY' | 'SELL';
    asset: string;
    amount_crypto: number;
    amount_fiat: number;
    fiat_currency: string;
    receiving_address: string;
}) {
    const session = await auth();
    if (!session) return { error: "Authentication required" };

    // 1. Verify KYC Status
    const { data: user } = await supabase
        .from('users')
        .select('kyc_status')
        .eq('id', session.user.id)
        .single();

    if (user?.kyc_status !== 'APPROVED') {
        return { error: "KYC verification required to trade" };
    }

    // 2. Check Inventory Availability
    const { data: inventory } = await supabase
        .from('inventory')
        .select('*')
        .eq('asset', data.asset)
        .single();

    if (data.type === 'BUY' && !inventory?.buy_enabled) {
        return { error: `${data.asset} buying is currently disabled` };
    }
    if (data.type === 'SELL' && !inventory?.sell_enabled) {
        return { error: `${data.asset} selling is currently disabled` };
    }

    // 3. Create Order
    try {
        const orderNumber = generateOrderNumber();

        const { error } = await supabase
            .from('orders')
            .insert({
                order_number: orderNumber,
                user_id: session.user.id,
                type: data.type,
                asset: data.asset,
                amount_crypto: data.amount_crypto,
                amount_fiat: data.amount_fiat,
                fiat_currency: data.fiat_currency,
                receiving_address: data.receiving_address,
                status: 'PENDING'
            });

        if (error) throw error;

        revalidatePath("/dashboard/orders");
        revalidatePath("/admin/orders");

        return { success: true, orderNumber };
    } catch {
        return { error: "Failed to process order" };
    }
}

export async function getInventory() {
    const { data } = await supabase
        .from('inventory')
        .select('*')
        .order('asset', { ascending: true });
    return data || [];
}
