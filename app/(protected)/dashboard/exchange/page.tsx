import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
    ShieldCheck,
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
        <div className="min-h-[calc(100vh-4rem)] w-full grid grid-cols-1 lg:grid-cols-2 gap-8 relative overflow-hidden">
            {/* Ambient Background - Fixed to viewport to prevent shift */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
                <div className="absolute bottom-0 left-0 w-full h-[500px] bg-linear-to-t from-background to-transparent" />
                {/* Dynamic Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] animate-float" />
            </div>

            {/* Left Column: Visuals & Market Context */}
            <div className="relative flex flex-col justify-center px-6 lg:px-12 py-12 lg:py-0 space-y-12">
                <div className="space-y-6 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">Live Exchange v2.0</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                        Limitless <br />
                        <span className="text-gradient">Horizons.</span>
                    </h1>

                    <p className="text-lg text-foreground/50 font-medium leading-relaxed max-w-md">
                        Experience the next evolution of digital asset exchange. Zero friction, instant settlements, and institutional-grade security.
                    </p>
                </div>

                {/* Market Pulse Micro-Grid */}
                <div className="grid grid-cols-2 gap-4 max-w-md opacity-80">
                    <div className="bg-white/5 border border-white/5 p-6 rounded-[24px] hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <Zap className="h-6 w-6 text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Speed</span>
                        </div>
                        <p className="text-3xl font-black tracking-tight">~14s</p>
                        <p className="text-xs font-bold text-foreground/40 mt-1">Avg. Settlement</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-6 rounded-[24px] hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <ShieldCheck className="h-6 w-6 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Security</span>
                        </div>
                        <p className="text-3xl font-black tracking-tight">100%</p>
                        <p className="text-xs font-bold text-foreground/40 mt-1">Insured Assets</p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold text-foreground/20 uppercase tracking-[0.2em]">
                    <span>Secure Pipeline</span>
                    <div className="h-px w-12 bg-white/10" />
                    <span>Encrypted</span>
                    <div className="h-px w-12 bg-white/10" />
                    <span>24/7 Active</span>
                </div>
            </div>

            {/* Right Column: Interaction Form */}
            <div className="relative flex flex-col justify-center items-center px-4 lg:px-12 py-12">
                {!isKycApproved ? (
                    <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] text-center space-y-6 shadow-2xl">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black tracking-tight">Access Restricted</h2>
                            <p className="text-sm font-medium text-foreground/50">Complete your verification to access the exchange terminal.</p>
                        </div>
                        <Link href="/dashboard/kyc/submit" className="block w-full py-4 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform">
                            Verify Identity
                        </Link>
                    </div>
                ) : (
                    <div className="w-full max-w-lg relative isolate">
                        {/* Form Decor */}
                        <div className="absolute -inset-1 bg-linear-to-b from-white/10 to-transparent rounded-[35px] -z-10 blur-xs" />
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-20 opacity-50" />

                        <TradingForm
                            initialInventory={inventory || []}
                            supportedAssets={supportedAssets}
                        />

                        <div className="mt-8 text-center">
                            <Link href="/dashboard/support" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-primary transition-colors">
                                <Info className="h-3 w-3" /> Report a Rate Issue
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
