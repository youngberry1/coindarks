"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export type AdminWallet = {
    id: string;
    chain: string; // e.g., 'Bitcoin', 'Ethereum'
    currency: string; // e.g., 'BTC', 'ETH', 'USDT'
    address: string;
    label?: string; // e.g., 'Cold Storage'
    is_active: boolean;
    created_at: string;
};

export async function getAdminWallets() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return [];

    let retries = 3;
    while (retries > 0) {
        try {
            const { data, error } = await supabaseAdmin
                .from('admin_wallets')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as AdminWallet[];
        } catch (error) {
            retries--;
            console.error(`Error fetching admin wallets (Attempts left: ${retries}):`, error);
            if (retries === 0) return [];
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return [];
}

export async function createAdminWallet(data: { chain: string; currency: string; address: string; label?: string }) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    const { data: newWallet, error } = await supabaseAdmin
        .from('admin_wallets')
        .insert({
            chain: data.chain,
            currency: data.currency,
            address: data.address,
            label: data.label,
            is_active: true
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating admin wallet:", error);
        return { error: "Failed to create wallet" };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/dashboard/buy");
    return { success: "Wallet added successfully", wallet: newWallet as AdminWallet };
}

export async function updateAdminWallet(id: string, data: { chain?: string; currency?: string; address?: string; label?: string; is_active?: boolean }) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    const { error } = await supabaseAdmin
        .from('admin_wallets')
        .update(data)
        .eq('id', id);

    if (error) {
        console.error("Error updating admin wallet:", error);
        return { error: "Failed to update wallet" };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/dashboard/buy");
    return { success: "Wallet updated successfully" };
}

export async function deleteAdminWallet(id: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

    const { error } = await supabaseAdmin
        .from('admin_wallets')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting admin wallet:", error);
        return { error: "Failed to delete wallet" };
    }

    revalidatePath("/admin/settings");
    return { success: "Wallet deleted successfully" };
}
