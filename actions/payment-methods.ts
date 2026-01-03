"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export type PaymentMethodType = 'BANK_ACCOUNT' | 'MOBILE_MONEY';

export interface PaymentMethod {
    id: string;
    method_type: PaymentMethodType;
    provider: string; // Bank Name or Network
    account_number: string;
    account_name: string;
    is_default: boolean;
}

export async function getPaymentMethods() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const { data } = await supabaseAdmin
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

    return (data as PaymentMethod[]) || [];
}

export async function addPaymentMethod(data: {
    method_type: PaymentMethodType;
    provider: string;
    account_number: string;
    account_name: string;
}) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    try {
        const { error } = await supabaseAdmin
            .from('user_payment_methods')
            .insert({
                user_id: session.user.id,
                method_type: data.method_type,
                provider: data.provider,
                account_number: data.account_number,
                account_name: data.account_name
            });

        if (error) throw error;

        revalidatePath("/dashboard/wallets");
        return { success: true };
    } catch (err) {
        console.error("Failed to add payment method:", err);
        return { error: "Failed to save payment method" };
    }
}

export async function deletePaymentMethod(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    try {
        const { error } = await supabaseAdmin
            .from('user_payment_methods')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id);

        if (error) throw error;

        revalidatePath("/dashboard/wallets");
        return { success: true };
    } catch (err) {
        console.error("Failed to delete payment method:", err);
        return { error: "Failed to delete payment method" };
    }
}
