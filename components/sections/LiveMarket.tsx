"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCcw, ExternalLink, Activity } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CryptoData {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    image: string;
}


export default function LiveMarket() {
    const [data, setData] = useState<CryptoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/market");
            const result = await response.json();
            if (Array.isArray(result)) {
                setData(result);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch crypto data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: value < 1 ? 4 : 2,
        }).format(value);
    };

    return (
        <section id="market" className="py-32 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Market Pulse
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-2xl sm:text-3xl font-black tracking-tight"
                        >
                            Global <span className="text-gradient">Real-Time</span> Rates
                        </motion.h2>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl glass border border-white/5 text-xs font-black uppercase tracking-widest hover:border-primary/40 transition-all disabled:opacity-50"
                        >
                            <RefreshCcw className={cn("h-4 w-4 text-primary transition-transform duration-700", loading && "animate-spin")} />
                            {loading ? "Syncing..." : "Refresh Feed"}
                        </button>
                        {lastUpdated && (
                            <span className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest">
                                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {loading && data.length === 0 ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <motion.div
                                    key={`skeleton-${i}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-[240px] rounded-[32px] glass-card animate-pulse shadow-sm"
                                />
                            ))
                        ) : (
                            data.map((asset, index) => (
                                <motion.a
                                    key={asset.id}
                                    href={`https://www.coingecko.com/en/coins/${asset.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative block p-8 rounded-[32px] glass-card hover:border-primary/20 transition-all duration-500 hover-lift"
                                >
                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0">
                                        <ExternalLink className="h-4 w-4 text-primary" />
                                    </div>

                                    <div className="flex items-center gap-5 mb-10">
                                        <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-foreground/5 p-3 flex items-center justify-center border border-white/5">
                                            <Image
                                                src={asset.image}
                                                alt={asset.name}
                                                width={40}
                                                height={40}
                                                className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl leading-none mb-1.5">{asset.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase text-foreground/30 tracking-widest leading-none bg-foreground/5 px-2 py-0.5 rounded-md">{asset.symbol}</span>
                                                <Activity className="h-3 w-3 text-primary animate-pulse" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Market Price</p>
                                            <p className="text-2xl font-black font-mono tracking-tight group-hover:text-primary transition-colors">
                                                {formatCurrency(asset.current_price)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">24h Dynamics</p>
                                            <div className={cn(
                                                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black font-mono",
                                                asset.price_change_percentage_24h >= 0
                                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10"
                                                    : "bg-red-500/10 text-red-500 border border-red-500/10"
                                            )}>
                                                {asset.price_change_percentage_24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                </motion.a>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center mt-20 space-y-4"
                >
                    <div className="h-px w-20 bg-linear-to-r from-transparent via-border to-transparent" />
                    <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.3em]">
                        Precision Liquidity Powered by <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary transition-colors underline-offset-4 decoration-1">CoinGecko</a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
