import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
    Coins,
    ShieldCheck,
    AlertCircle,
    Info
} from "lucide-react";
import Link from "next/link";
import { TradingForm } from "@/components/dashboard/TradingForm";
import { getCryptos } from "@/actions/crypto";

export const metadata: Metadata = {
    title: "Instant Exchange | CoinDarks",
    description: "Exchange crypto and fiat instantly with the best rates in Ghana and Nigeria.",
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2 text-gradient">Instant Exchange</h1>
                    <p className="text-foreground/50 font-medium">
                        Buy or Sell crypto instantly at competitive market rates.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Badge removed as per request */}
                </div>
            </div>

            {!isKycApproved ? (
                <div className="p-8 rounded-[40px] border border-amber-500/20 bg-amber-500/5 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-amber-500/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                        <ShieldCheck className="h-40 w-40" />
                    </div>

                    <div className="max-w-xl relative shrink-0">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                            <AlertCircle className="h-6 w-6 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-black mb-3">Verification Required</h2>
                        <p className="text-foreground/50 font-medium leading-relaxed mb-8">
                            To ensure platform security and comply with financial regulations, you must complete your Identity Verification (KYC) before you can start trading.
                        </p>
                        <Link
                            href="/dashboard/kyc/submit"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 text-white font-bold shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all"
                        >
                            Start Verification Now
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    {/* Main Trading Area */}
                    <div className="lg:col-span-8">
                        <TradingForm initialInventory={inventory || []} supportedAssets={supportedAssets} />
                    </div>

                    {/* Sidebar / Info Area */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="p-8 rounded-[40px] border border-border bg-card-bg/50 backdrop-blur-xl shadow-sm dark:shadow-none">
                            <h3 className="text-lg font-black mb-6">Trading Information</h3>
                            <div className="space-y-8">
                                <div className="flex gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Clock className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black uppercase tracking-tight">Processing Time</p>
                                        <p className="text-xs text-foreground/40 font-medium leading-relaxed">Orders are processed within 5-30 minutes after payment verification.</p>
                                    </div>
                                </div>
                                <div className="flex gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Info className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black uppercase tracking-tight">Manual Approval</p>
                                        <p className="text-xs text-foreground/40 font-medium leading-relaxed">Our finance team manually verifies every transaction to ensure absolute security.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Assets Card */}
                        <div className="p-8 rounded-[40px] border border-border bg-linear-to-br from-primary/5 to-transparent shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Coins className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Available Assets</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {inventory?.filter(i => i.is_active).map(i => (
                                    <span key={i.id} className="px-4 py-2 rounded-xl bg-card-bg border border-border text-[11px] font-black uppercase tracking-widest shadow-sm dark:shadow-none transition-all hover:border-primary/30">
                                        {i.symbol}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Internal icons helper for processing time info
function Clock({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
