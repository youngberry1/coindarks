import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
    Coins,
    ShieldCheck,
    AlertCircle,
    Info,
    Clock,
    Zap
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
        <div className="space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-12 bg-primary rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Market Service</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
                        Instant <span className="text-primary text-gradient">Exchange</span>
                    </h1>
                    <p className="max-w-xl text-foreground/40 font-bold text-sm md:text-base leading-relaxed">
                        Fast, secure, and reliable cryptocurrency swaps with competitive rates and high liquidity.
                    </p>
                </div>

                {!isKycApproved && (
                    <Link
                        href="/dashboard/kyc/submit"
                        className="group flex items-center gap-6 p-6 rounded-[32px] bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all duration-500 max-w-md shadow-2xl"
                    >
                        <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500">
                            <ShieldCheck className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-xs uppercase tracking-tight">Identity Verification Required</p>
                            <p className="text-[11px] text-foreground/40 font-bold leading-relaxed">Please complete your verification to enable high-volume trading and withdrawals.</p>
                        </div>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
                {/* Main Action Area */}
                <div className="lg:col-span-8 order-1">
                    {!isKycApproved ? (
                        <div className="group relative p-12 md:p-20 rounded-[64px] border border-white/5 bg-white/2 backdrop-blur-3xl overflow-hidden text-center space-y-10">
                            <div className="absolute inset-0 bg-linear-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                            <div className="relative">
                                <div className="h-32 w-32 rounded-[48px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/20 group-hover:scale-110 transition-transform duration-700">
                                    <AlertCircle className="h-16 w-16 text-amber-500" />
                                </div>

                                <div className="space-y-4 max-w-md mx-auto">
                                    <h2 className="text-4xl font-black uppercase tracking-tighter">Trading <span className="text-amber-500">Disabled</span></h2>
                                    <p className="text-foreground/40 font-bold leading-relaxed italic">
                                        &quot;To maintain security and comply with regulations, please verify your identity before initiating your first trade.&quot;
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/dashboard/kyc/submit"
                                className="inline-flex items-center gap-4 px-12 py-6 rounded-[28px] bg-primary text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all relative z-10"
                            >
                                <Zap className="h-4 w-4" />
                                Start Verification Status
                            </Link>
                        </div>
                    ) : (
                        <TradingForm
                            initialInventory={inventory || []}
                            supportedAssets={supportedAssets}
                        />
                    )}
                </div>

                {/* Information Sidebar */}
                <div className="lg:col-span-4 space-y-8 order-2">
                    {/* Trading Info Card */}
                    <div className="p-10 rounded-[48px] border border-white/5 bg-white/2 backdrop-blur-3xl space-y-10 group/info relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover/info:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Info className="h-5 w-5" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Trade Information</p>
                        </div>

                        <div className="space-y-10">
                            <div className="group flex gap-6 hover:translate-x-2 transition-transform duration-500">
                                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:text-primary transition-colors">
                                    <Clock className="h-7 w-7" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-sm uppercase tracking-tight">Processing Time</p>
                                    <p className="text-[11px] text-foreground/40 font-bold leading-relaxed">Orders are typically completed within 5-30 minutes after payment confirm.</p>
                                </div>
                            </div>

                            <div className="group flex gap-6 hover:translate-x-2 transition-transform duration-500">
                                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:text-emerald-500 transition-colors">
                                    <ShieldCheck className="h-7 w-7" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-sm uppercase tracking-tight">Transaction Security</p>
                                    <p className="text-[11px] text-foreground/40 font-bold leading-relaxed">Every trade is manually reviewed by our security team to ensure safety.</p>
                                </div>
                            </div>

                            <div className="group flex gap-6 hover:translate-x-2 transition-transform duration-500">
                                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:text-amber-500 transition-colors">
                                    <Zap className="h-7 w-7" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-sm uppercase tracking-tight">Expert Support</p>
                                    <p className="text-[11px] text-foreground/40 font-bold leading-relaxed">Our 24/7 support desk is always ready to assist with your transactions.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Supported Assets Card */}
                    <div className="p-10 rounded-[48px] border border-white/5 bg-linear-to-br from-primary/5 to-transparent relative overflow-hidden group/assets">
                        <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12 group-hover/assets:rotate-0 transition-transform duration-1000">
                            <Coins className="h-32 w-32" />
                        </div>
                        <div className="flex items-center gap-4 mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Supported Assets</h3>
                        </div>
                        <div className="flex flex-wrap gap-3 relative z-10">
                            {(inventory || []).filter(i => i.is_active).map((asset) => (
                                <div
                                    key={asset.id}
                                    className="px-5 py-2.5 rounded-2xl bg-black/40 border border-white/5 text-[10px] font-black uppercase tracking-wider text-foreground/60 hover:border-primary transition-all cursor-default"
                                >
                                    {asset.symbol}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
