import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
    ShieldCheck,
    Activity,
    Zap
} from "lucide-react";
import Link from "next/link";
import { TradingForm } from "@/components/dashboard/TradingForm";
import { getCryptos } from "@/actions/crypto";
import { getExchangeRates } from "@/actions/rates";
import { getGlobalMarketStats, getRecentOrders } from "@/actions/market";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Market Trade Desk | CoinDarks",
    description: "High-trust digital asset trade terminal.",
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

    const isAdmin = session.user.role === 'ADMIN';

    const [inventory, allRates, globalStats, recentOrders] = await Promise.all([
        getCryptos(true),
        getExchangeRates(),
        getGlobalMarketStats(),
        getRecentOrders(4, isAdmin ? undefined : session.user.id)
    ]);

    const { data: user } = await supabaseAdmin
        .from('users')
        .select('kyc_status')
        .eq('id', session.user.id)
        .single();

    const isKycApproved = user?.kyc_status === 'APPROVED' || isAdmin;

    const supportedAssets = (inventory || [])
        .filter(item => item.stock_status === 'IN STOCK')
        .map(item => {
            const usdRate = allRates.find(r => r.pair === `${item.symbol}-USD` || r.pair === `${item.symbol}-USDT`);
            return {
                id: item.symbol,
                name: item.name,
                icon: item.icon_url,
                price: usdRate ? usdRate.display_rate : 0,
                change: usdRate ? usdRate.percent_change_24h : 0,
                coingeckoId: ASSET_METADATA[item.symbol]?.coingeckoId || item.name.toLowerCase().replace(' ', '-')
            };
        });

    const stats = [
        { label: "Market Volume (24h)", value: `$${(globalStats.volume24h / 1e9).toFixed(1)}B`, icon: <Activity className="h-4 w-4 text-primary" />, trend: `${globalStats.volumeChange24h > 0 ? '+' : ''}${globalStats.volumeChange24h.toFixed(1)}%` },
        { label: "Market Share (BTC)", value: `${globalStats.btcDominance.toFixed(1)}%`, icon: <Zap className="h-4 w-4 text-yellow-500" />, trend: "LIVE" },
        { label: "Platform Status", value: "Online", icon: <ShieldCheck className="h-4 w-4 text-primary" />, trend: "100%" }
    ];

    return (
        <div className="w-full text-white">
            {/* Background Texture / Atmosphere */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(var(--primary), 0.01)_0%,transparent_50%)]" />
                <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" />
            </div>

            <div className="relative z-10 w-full max-w-[1800px] mx-auto p-4 lg:px-6 lg:py-8 space-y-8">
                {/* Top Statistics Bar (Nexus Header) */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className={cn(
                            "bg-black/20 backdrop-blur-xl border border-white/5 rounded-[24px] p-4 sm:p-7 flex flex-col justify-between group hover:border-primary/20 transition-all duration-500",
                            i === 2 && "col-span-2 lg:col-span-1"
                        )}>
                            <div className="flex items-center justify-between mb-3 gap-2">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] font-mono truncate">{stat.label}</span>
                                <div className="p-2 bg-white/5 rounded-lg shrink-0">{stat.icon}</div>
                            </div>
                            <div className="flex items-end justify-between gap-1 overflow-hidden">
                                <span className="text-xl sm:text-2xl font-black font-mono tracking-tighter tabular-nums truncate">{stat.value}</span>
                                <span className={cn(
                                    "text-[10px] font-black font-mono tracking-wider shrink-0",
                                    stat.trend.startsWith('+') || stat.trend === 'LIVE' || stat.trend === 'ONLINE' || stat.trend === '100%' ? "text-primary/60" : "text-red-500/60"
                                )}>{stat.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>


                {/* Main Trading Terminal - Full Width */}
                <div className="space-y-8">
                    <div className="flex flex-col">
                        {!isKycApproved ? (
                            <div className="w-full max-w-2xl mx-auto bg-[#16191E] border border-white/5 p-12 md:p-20 rounded-[2.5rem] text-center space-y-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent" />
                                <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                    <ShieldCheck className="h-10 w-10 text-primary" />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Identity Check Required</h2>
                                    <p className="text-sm font-medium text-white/30 leading-relaxed uppercase tracking-wider">Access to the Market Trade Desk is restricted until identity protocols are verified.</p>
                                </div>
                                <Link href="/dashboard/kyc/submit" className="flex items-center justify-center w-full py-5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                    Complete ID Verification
                                </Link>
                            </div>
                        ) : (
                            <div className="w-full flex justify-center">
                                <TradingForm
                                    initialInventory={inventory || []}
                                    supportedAssets={supportedAssets}
                                />
                            </div>
                        )}
                    </div>

                    {/* Recent Activity - Below Trading Form */}
                    <div className="max-w-md mx-auto bg-black/10 border border-white/5 rounded-[32px] p-6 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/10 font-mono">Recent Trades</h3>
                        <div className="space-y-5">
                            {recentOrders.length > 0 ? (
                                recentOrders.map(order => (
                                    <div key={order.id} className="flex items-start justify-between group">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-1.5 w-1.5 rounded-full",
                                                    order.status === 'COMPLETED' ? "bg-primary/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-yellow-500/50"
                                                )} />
                                                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] font-mono group-hover:text-white transition-colors">{order.order_number}</span>
                                            </div>
                                            <div className="text-[10px] font-mono font-black text-white/40 tracking-tight pl-3.5">
                                                {order.amount_crypto} {order.asset}
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest pt-0.5">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-[9px] font-black text-white/5 uppercase tracking-widest text-center py-4 italic font-mono space-y-3">
                                    <Activity className="h-4 w-4 mx-auto animate-pulse opacity-20" />
                                    <div>Waiting for trades...</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
