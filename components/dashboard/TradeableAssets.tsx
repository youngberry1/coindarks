'use client';

import { useEffect, useState } from 'react';
import { getCryptos, Cryptocurrency } from '@/actions/crypto';
import { CryptoIcon } from '@/components/CryptoIcon';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Zap, TrendingUp } from 'lucide-react';

interface TradeableAssetsProps {
    initialData?: Cryptocurrency[];
}

export default function TradeableAssets({ initialData = [] }: TradeableAssetsProps) {
    const [cryptos, setCryptos] = useState<Cryptocurrency[]>(initialData);
    const [, setIsLoading] = useState(initialData.length === 0);

    useEffect(() => {
        if (initialData.length === 0) {
            getCryptos(true).then((data) => {
                setCryptos(data);
                setIsLoading(false);
            });
        }
    }, [initialData]);

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase">
                        Active <span className="text-gradient">Assets.</span>
                    </h2>
                    <p className="text-xs text-foreground/40 font-black uppercase tracking-[0.2em]">Operational Liquidity Nodes</p>
                </div>

                <div className="px-4 py-2 rounded-2xl glass border border-white/5 flex items-center gap-3">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Live Inventory Sync</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cryptos.map((crypto, idx) => {
                    const inStock = crypto.stock_status === 'IN STOCK';

                    return (
                        <motion.div
                            key={crypto.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[40px] blur-xl" />

                            <div className="relative glass-card border border-white/5 p-8 rounded-[40px] transition-all duration-500 hover:border-white/10 hover:-translate-y-1 overflow-hidden">
                                {/* Decor */}
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                                    <TrendingUp className="h-32 w-32 rotate-12" />
                                </div>

                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="h-16 w-16 rounded-[24px] bg-white/5 p-3 flex items-center justify-center border border-white/5 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                            <CryptoIcon
                                                symbol={crypto.symbol}
                                                iconUrl={crypto.icon_url}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                                            inStock ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                        )}>
                                            {inStock ? 'Ready' : 'Depleted'}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black tracking-tight uppercase">{crypto.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">{crypto.symbol}</span>
                                            <div className="h-1 w-1 rounded-full bg-white/10" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 flex items-center gap-1">
                                                Active Chain <Zap className="h-3 w-3" />
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">Market Status</p>
                                            <p className={cn("text-xs font-black uppercase tracking-wider", inStock ? "text-emerald-500" : "text-red-500")}>
                                                {crypto.stock_status}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10 shadow-2xl shadow-primary/20">
                                            <Zap className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
