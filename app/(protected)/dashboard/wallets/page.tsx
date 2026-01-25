
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getWallets } from "@/actions/wallets";
import { getPaymentMethods } from "@/actions/payment-methods";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ShieldCheck } from "lucide-react";
import { WalletsTabs } from "@/components/dashboard/WalletsTabs";

export const metadata: Metadata = {
    title: "My Accounts | CoinDarks",
    description: "Manage your saved deposit and payment accounts.",
};

export default async function WalletsPage(props: { searchParams: Promise<{ tab?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await auth();
    if (!session) redirect("/login");

    const activeTab = searchParams.tab || "crypto";

    const wallets = await getWallets();
    const paymentMethods = await getPaymentMethods();

    // Fetch supported assets dynamically from the new cryptocurrencies table
    const { data: dbAssets } = await supabaseAdmin
        .from('cryptocurrencies')
        .select('*')
        .eq('is_active', true)
        .order('symbol');

    const assets = dbAssets || [];

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">My Accounts</h1>
                    <p className="text-sm md:text-base text-foreground/50 font-medium">Manage your external deposit points and payment destinations.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 w-full md:w-auto">
                        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                        <div>
                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest leading-none mb-1">Security</p>
                            <p className="text-sm font-bold">Verified Only</p>
                        </div>
                    </div>
                </div>
            </div>

            <WalletsTabs
                activeTab={activeTab}
                wallets={wallets}
                paymentMethods={paymentMethods}
                assets={assets as any}
            />
        </div>
    );
}
