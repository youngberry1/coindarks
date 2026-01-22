import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
    ShieldCheck,
    Clock,
    Zap,
    Info
} from "lucide-react";
import Link from "next/link";
import { TradingForm } from "@/components/dashboard/TradingForm";
import { getCryptos } from "@/actions/crypto";

export const metadata: Metadata = {
    title: "Instant Exchange | CoinDarks",
    description: "Exchange crypto and fiat instantly with the best rates.",
};

const ASSET_METADATA: Record<string, { name: string; coingeckoId: string }> = {
    "BTC": { name: "Bitcoin", coingeckoId: "bitcoin" },
    "XLM": { name: "Stellar", coingeckoId: "stellar" },
    "USDT": { name: "Tether", coingeckoId: "tether" },
    "USDC": { name: "USD Coin", coingeckoId: "usd-coin" },
    "SOL": { name: "Solana", coingeckoId: "solana" },
    "LTC": { name: "Litecoin", coingeckoId: "litecoin" },
};

export default async function ExchangePage() {
    const session = await auth();
    if (!session) redirect("/login");

    // 1. Fetch User Data (KYC status)
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('kyc_status')
        .eq('id', session.user.id)
        .single();

    // 2. Fetch Available Inventory
    const inventory = await getCryptos(false);
    const isAdmin = session.user.role === 'ADMIN';
    const isKycApproved = user?.kyc_status === 'APPROVED' || isAdmin;

    const supportedAssets = (inventory || [])
        .filter(item => item.is_active && item.stock_status === 'IN STOCK')
        .map(item => ({
            id: item.symbol,
            name: item.name,
            icon: item.icon_url,
            coingeckoId: ASSET_METADATA[item.symbol]?.coingeckoId || item.name.toLowerCase().replace(' ', '-')
        }));

    return (
        <div className="min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden py-6 md:py-0">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px] -z-10" />

            <div className="w-full max-w-lg mx-auto px-4 flex flex-col items-center gap-8 z-10">

                {/* Minimal Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter">Instant <span className="text-primary">Exchange</span></h1>
                    <p className="text-foreground/40 font-medium text-xs md:text-sm">Best rates, zero hidden fees.</p>
                </div>

                {/* Main Trading Area */}
                <div className="w-full">
                    {!isKycApproved ? (
                        <div className="max-w-sm mx-auto p-6 rounded-2xl border border-white/5 bg-white/2 backdrop-blur-xl text-center space-y-4">
                            <div className="h-12 w-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold">Verification Required</h2>
                                <p className="text-xs text-foreground/50">Verify identity to trade.</p>
                            </div>
                            <Link href="/dashboard/kyc/submit" className="block w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                                Start Verification
                            </Link>
                        </div>
                    ) : (
                        <TradingForm
                            initialInventory={inventory || []}
                            supportedAssets={supportedAssets}
                        />
                    )}
                </div>

                {/* Features Footer (Compact Strip) */}
                <div className="flex items-center justify-center gap-6 md:gap-12 opacity-50 w-full pt-4">
                    <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-primary" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">15m Settle</span>
                    </div>

                    <div className="h-3 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Live Rates</span>
                    </div>
                </div>

                {/* Help Link */}
                <Link href="/dashboard/support" className="flex items-center gap-2 text-[10px] font-bold text-foreground/20 hover:text-foreground/50 transition-colors">
                    <Info className="h-3 w-3" /> Report Issue
                </Link>

            </div>
        </div>
    );
}
