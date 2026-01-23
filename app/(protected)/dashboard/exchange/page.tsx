import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
    ShieldCheck,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Zap
} from "lucide-react";
import { CryptoIcon } from "@/components/CryptoIcon";
import Link from "next/link";
import { TradingForm } from "@/components/dashboard/TradingForm";
import { getCryptos } from "@/actions/crypto";
import { getExchangeRates } from "@/actions/rates";
import { getGlobalMarketStats, getActiveSessions, getRecentOrders } from "@/actions/market";
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

    const { data: user } = await supabaseAdmin
        .from('users')
        .select('kyc_status')
        .eq('id', session.user.id)
        .single();

    const [inventory, allRates, globalStats, sessionCount, recentOrders] = await Promise.all([
        getCryptos(true),
        getExchangeRates(),
        getGlobalMarketStats(),
        getActiveSessions(),
        getRecentOrders(4)
    ]);

    const isAdmin = session.user.role === 'ADMIN';
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
        { label: "Market Activity (24h)", value: `$${(globalStats.volume24h / 1e9).toFixed(1)}B`, icon: <Activity className="h-4 w-4 text-primary" />, trend: `${globalStats.volumeChange24h > 0 ? '+' : ''}${globalStats.volumeChange24h.toFixed(1)}%` },
        { label: "BITCOIN SHARE", value: `${globalStats.btcDominance.toFixed(1)}%`, icon: <Zap className="h-4 w-4 text-yellow-500" />, trend: "LIVE" },
        { label: "SYSTEM HEALTH", value: "STABLE", icon: <ShieldCheck className="h-4 w-4 text-primary" />, trend: "100%" },
        { label: "USERS ONLINE", value: sessionCount, icon: <TrendingUp className="h-4 w-4 text-blue-500" />, trend: "ONLINE" }
    ];

    return (
        <div className="min-h-[calc(100vh-4rem)] w-full bg-background text-white overflow-x-hidden">
            {/* Background Texture / Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(var(--primary), 0.02)_0%,transparent_50%)]" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(var(--primary), 0.02)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <div className="relative z-10 w-full max-w-[1800px] mx-auto p-4 lg:px-6 lg:py-8 space-y-8">
                {/* Top Statistics Bar (Nexus Header) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-[#16191E] border border-white/5 rounded-2xl p-4 md:p-6 flex flex-col justify-between group hover:bg-[#1C2127] transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{stat.label}</span>
                                {stat.icon}
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-xl font-black tabular-nums">{stat.value}</span>
                                <span className={stat.trend.startsWith('+') || stat.trend === 'LIVE' || stat.trend === 'ONLINE' || stat.trend === '100%' ? "text-[10px] text-primary font-bold" : "text-[10px] text-red-500 font-bold"}>{stat.trend}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Panel: Market Tickers & Feed */}
                    <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
                        <div className="bg-[#16191E] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Price Tracker</h3>
                                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            </div>

                            <div className="space-y-2">
                                {supportedAssets.slice(0, 6).map((asset) => (
                                    <div key={asset.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 relative shrink-0 group-hover:scale-110 transition-transform">
                                                <CryptoIcon
                                                    symbol={asset.id}
                                                    iconUrl={asset.icon}
                                                />
                                            </div>
                                            <div>
                                                <div className="font-black text-sm">{asset.id}</div>
                                                <div className="text-[10px] font-bold text-white/20 uppercase">{asset.name}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-sm font-bold text-primary">
                                                ${asset.price > 0 ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                                            </div>
                                            <div className={cn(
                                                "flex items-center gap-1 text-[10px] font-bold justify-end",
                                                asset.change >= 0 ? "text-primary/50" : "text-red-500/50"
                                            )}>
                                                {asset.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                                                {Math.abs(asset.change).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* Order History Preview */}
                        <div className="bg-[#16191E]/50 border border-white/5 rounded-3xl p-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/20 mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map(order => (
                                        <div key={order.id} className="flex items-center justify-between text-[10px] font-bold">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-1.5 w-1.5 rounded-full animate-pulse",
                                                    order.status === 'COMPLETED' ? "bg-primary" : "bg-yellow-500"
                                                )} />
                                                <span className="text-white/40 uppercase">{order.order_number}</span>
                                            </div>
                                            <span className="text-primary font-mono">{order.amount_crypto} {order.asset}</span>
                                            <span className="text-white/20">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[10px] font-bold text-white/10 italic text-center py-4">
                                        Listening for executions...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Terminal */}
                    <div className="lg:col-span-8 flex flex-col order-1 lg:order-2">
                        {!isKycApproved ? (
                            <div className="w-full max-w-2xl bg-[#16191E] border border-white/5 p-12 md:p-20 rounded-[2.5rem] text-center space-y-8 shadow-2xl relative overflow-hidden">
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
                </div>
            </div>
        </div>
    );
}
