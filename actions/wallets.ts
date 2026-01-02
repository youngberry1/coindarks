"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function saveWallet(asset: string, address: string, network: string = 'Native', name: string = 'My Wallet') {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        console.log("Saving wallet:", { userId: session.user.id, asset, address, network });
        const { data, error } = await supabaseAdmin
            .from('wallets')
            .upsert({
                user_id: session.user.id,
                asset,
                address,
                network,
                name,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, asset, network, name' });

        if (error) {
            console.error("Supabase error saving wallet:", error);
            throw error;
        }

        console.log("Wallet saved successfully:", data);
        revalidatePath("/dashboard/wallets");
        revalidatePath("/dashboard/settings");
        return { success: `${name} (${asset}/${network}) saved!` };
    } catch (err: unknown) {
        console.error("Failed to save wallet:", err);
        return { error: err instanceof Error ? err.message : `Failed to save ${asset} wallet` };
    }
}

export async function deleteWallet(asset: string, network: string, name: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const { error } = await supabaseAdmin
            .from('wallets')
            .delete()
            .eq('user_id', session.user.id)
            .eq('asset', asset)
            .eq('network', network)
            .eq('name', name);

        if (error) throw error;
        revalidatePath("/dashboard/wallets");
        revalidatePath("/dashboard/settings");
        return { success: `${name} removed` };
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
