"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function saveWallet(asset: string, address: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const { error } = await supabaseAdmin
            .from('wallets')
            .upsert({
                user_id: session.user.id,
                asset,
                address,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, asset' });

        if (error) throw error;
        revalidatePath("/dashboard/settings");
        return { success: `${asset} wallet saved!` };
    } catch {
        return { error: `Failed to save ${asset} wallet` };
    }
}

export async function deleteWallet(asset: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const { error } = await supabaseAdmin
            .from('wallets')
            .delete()
            .eq('user_id', session.user.id)
            .eq('asset', asset);

        if (error) throw error;
        revalidatePath("/dashboard/settings");
        return { success: `${asset} wallet removed` };
    } catch {
        return { error: `Failed to delete ${asset} wallet` };
    }
}

export async function getWallets() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const { data: wallets } = await supabaseAdmin
            .from('wallets')
            .select('*')
            .eq('user_id', session.user.id);

        return wallets || [];
    } catch {
        return [];
    }
}
