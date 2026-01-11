import { Metadata } from "next";
import { getAdminWallets } from "@/actions/admin-wallets";
import { getExchangeRates } from "@/actions/rates";
import { Settings } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { AdminSettingsTabs } from "@/components/admin/settings/AdminSettingsTabs";

export const metadata: Metadata = {
    title: "System Settings | CoinDarks Admin",
    description: "Configure exchange parameters and deposit addresses.",
};

export default async function AdminSettingsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const wallets = await getAdminWallets();
    const rates = await getExchangeRates();

    // Fetch full admin user data
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                    <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Admin Settings</h1>
                    <p className="text-foreground/40 font-medium">Manage system parameters and your account.</p>
                </div>
            </div>

            <AdminSettingsTabs
                user={userData}
                wallets={wallets}
                rates={rates}
            />
        </div>
    );
}
