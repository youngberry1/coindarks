"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCcw, ExternalLink } from "lucide-react";
import Image from "next/image";

interface CryptoData {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    image: string;
}

const ASSET_IDS = ["bitcoin", "stellar", "tether", "usd-coin", "solana", "litecoin"];

export default function LiveMarket() {
    const [data, setData] = useState<CryptoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ASSET_IDS.join(",")}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`
            );
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
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Update every 60 seconds
        return () => clearInterval(interval);
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: value < 1 ? 4 : 2,
        }).format(value);
    };

    return (
        <section id="market" className="py-24 relative overflow-hidden bg-background">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ type: "spring", stiffness: 50, damping: 15 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-4"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Market Data
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.1 }}
                            className="text-3xl sm:text-5xl font-extrabold tracking-tight"
                        >
                            Real-Time <span className="text-gradient">Market Rates</span>
                        </motion.h2>
                    </div>

                    <div className="flex flex-col items-end gap-2 h-[38px] justify-center">
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-primary transition-colors disabled:opacity-50"
                        >
                            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            {loading ? "Updating..." : "Refresh Prices"}
                        </button>
                        {lastUpdated && (
                            <span className="text-[10px] text-foreground/20 font-mono uppercase tracking-tighter">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading && data.length === 0 ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-[218px] rounded-4xl bg-white/5 animate-pulse border border-white/5" />
                        ))
                    ) : (
                        data.map((asset, index) => (
                            <motion.a
                                key={asset.id}
                                href={`https://www.coingecko.com/en/coins/${asset.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.15 }}
                                transition={{
                                    duration: 0.5,
                                    ease: "easeOut",
                                    delay: index * 0.05
                                }}
                                className="group block relative overflow-hidden p-8 rounded-4xl border border-card-border bg-card-bg hover:bg-foreground/3 transition-all duration-500 will-change-transform transform-gpu"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    <ExternalLink className="h-4 w-4 text-primary" />
                                </div>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="relative h-12 w-12 rounded-2xl overflow-hidden bg-white/5 p-2 flex items-center justify-center">
                                        <Image
                                            src={asset.image}
                                            alt={asset.name}
                                            width={32}
                                            height={32}
                                            className="object-contain"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-none mb-1">{asset.name}</h3>
                                        <span className="text-xs font-black uppercase text-foreground/30 tracking-widest">{asset.symbol}</span>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-1">Current Price</p>
                                        <p className="text-2xl font-black font-mono">
                                            {formatCurrency(asset.current_price)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">24h Change</p>
                                        <div className={`flex items-center gap-1 font-mono font-bold text-sm ${asset.price_change_percentage_24h >= 0 ? "text-emerald-500" : "text-red-500"
                                            }`}>
                                            {asset.price_change_percentage_24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                            {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Inner glow effect on hover */}
                                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </motion.a>
                        ))
                    )}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-12 text-[10px] text-foreground/30 font-medium uppercase tracking-[0.2em]"
                >
                    Data provided by <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CoinGecko</a>
                </motion.p>
            </div>
        </section>
    );
}
