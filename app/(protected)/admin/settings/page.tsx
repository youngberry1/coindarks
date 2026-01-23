import { Metadata } from "next";
import { getAdminWallets } from "@/actions/admin-wallets";
import { getExchangeRates } from "@/actions/rates";
import { Cpu } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { AdminSettingsTabs } from "@/components/admin/settings/AdminSettingsTabs";

export const metadata: Metadata = {
    title: "System Rules | CoinDarks Admin",
    description: "Institutional configuration of exchange parameters and infrastructure endpoints.",
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
        <div className="space-y-10 sm:space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header / Global Control Focus */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 lg:gap-10">
                <div className="space-y-4 max-w-full overflow-hidden">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-foreground/40 truncate">Settings Hub : System Configuration</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] uppercase wrap-break-word">
                        System <br />
                        <span className="text-gradient leading-relaxed">Rules.</span>
                    </h1>
                    <p className="text-sm sm:text-base lg:text-xl text-foreground/50 font-medium max-w-2xl leading-relaxed wrap-break-word">
                        Configure platform rules, manage deposit addresses,
                        and update system security settings across the global bridge.
                    </p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <div className="h-10 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl glass border border-white/5 flex items-center gap-2.5 sm:gap-3 text-foreground/30 shadow-2xl">
                        <Cpu className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary" />
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-widest">System Online</span>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <AdminSettingsTabs
                user={userData}
                wallets={wallets}
                rates={rates}
            />
        </div>
    );
}
