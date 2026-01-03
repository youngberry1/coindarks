"use client";

import { useState } from "react";
import { updateRateConfig, createRatePair, deleteRatePair, ExchangeRate } from "@/actions/rates";
import { toast } from "sonner";
import { Plus, RefreshCw, Calculator, DollarSign, Activity, Trash2, Loader2, Info, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";



interface ExchangeRateManagerProps {
    initialRates: ExchangeRate[];
}

export function ExchangeRateManager({ initialRates }: ExchangeRateManagerProps) {
    const [rates, setRates] = useState<ExchangeRate[]>(initialRates);
    const [newPair, setNewPair] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);

    // Delete State
    const [pairToDelete, setPairToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUpdate = async (pair: string, changes: Partial<ExchangeRate>) => {
        setLoading(pair);
        // Optimistic update
        setRates(prev => prev.map(r => r.pair === pair ? { ...r, ...changes } : r));

        const res = await updateRateConfig(pair, {
            manual_rate: changes.manual_rate === null ? undefined : changes.manual_rate,
            margin_percent: changes.margin_percent,
            is_automated: changes.is_automated
        });

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Rate updated");
        }
        setLoading(null);
    };

    const handleAddPair = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPair) return;

        const toastId = toast.loading("Adding pair...");
        const res = await createRatePair(newPair.toUpperCase());

        if (res.success && res.rate) {
            const newRate = res.rate;
            toast.success("Pair added", { id: toastId });
            setRates(prev => [newRate, ...prev]);
            setNewPair("");
            setIsAdding(false);
        } else {
            toast.error(res.error || "Failed to add", { id: toastId });
        }
    };

    const confirmDelete = async () => {
        if (!pairToDelete) return;
        setIsDeleting(true);
        const toastId = toast.loading("Removing pair...");

        try {
            const res = await deleteRatePair(pairToDelete);

            if (res.success) {
                setRates(prev => prev.filter(r => r.pair !== pairToDelete));
                toast.success("Pair removed", { id: toastId });
            } else {
                toast.error(res.error || "Failed to delete", { id: toastId });
            }
        } catch {
            toast.error("Failed to delete", { id: toastId });
        } finally {
            setIsDeleting(false);
            setPairToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Exchange Rates</h2>
                    <p className="text-sm text-foreground/40">Manage price feeds and profit margins.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 text-foreground rounded-xl font-bold text-xs hover:bg-white/10 transition-all border border-white/5"
                >
                    <Plus className="w-4 h-4" />
                    ADD PAIR
                </button>
            </div>

            {/* Admin Guidance / Help Section */}
            <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Info className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider">Exchange Logic Guide</h3>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest leading-none mt-1">How your rates are calculated</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                            <Activity className="h-3 w-3" /> Step 1: Direct Pair Matching
                        </div>
                        <p className="text-xs text-foreground/60 leading-relaxed font-medium">
                            The system first looks for an exact match (e.g., <code className="text-primary">BTC-GHS</code>). If found, it uses that specific rate and margin.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                            <ArrowRightLeft className="h-3 w-3" /> Step 2: Global Multiplier (Fallback)
                        </div>
                        <p className="text-xs text-foreground/60 leading-relaxed font-medium">
                            If no direct pair exists, it calculates: <br />
                            <span className="text-foreground font-bold">(Asset-USD Rate)</span> × <span className="text-foreground font-bold">(USD-Fiat Rate)</span>.
                        </p>
                    </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                    <div className="h-6 w-6 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Calculator className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Cedi (GHS) Optimization Tip</p>
                        <p className="text-xs text-foreground/50 font-medium leading-relaxed">
                            Since CoinGecko doesn&apos;t support GHS, you only need to manage **one manual rate** for <code className="bg-amber-500/10 px-1 rounded text-amber-500 font-bold italic">USD-GHS</code> or <code className="bg-amber-500/10 px-1 rounded text-amber-500 font-bold italic">USDT-GHS</code>.
                            This single rate will automatically update the prices for ALL crypto assets when users trade in GHS.
                        </p>
                    </div>
                </div>
            </div>

            {isAdding && (
                <form onSubmit={handleAddPair} className="flex gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 mb-4">
                    <input
                        autoFocus
                        value={newPair}
                        onChange={(e) => setNewPair(e.target.value)}
                        placeholder="e.g. BTC-USD"
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary uppercase font-mono"
                    />
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">
                        SAVE
                    </button>
                </form>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {rates.map((rate) => (
                    <div key={rate.pair} className="relative p-5 rounded-[24px] border border-white/5 bg-card-bg/50 backdrop-blur-md hover:border-primary/20 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-linear-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center border border-white/5">
                                    <DollarSign className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">{rate.pair}</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className={cn("h-1.5 w-1.5 rounded-full", rate.is_automated ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">
                                            {rate.is_automated ? "Live Feed" : "Manual Override"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleUpdate(rate.pair, { is_automated: !rate.is_automated })}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        rate.is_automated ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-white/5 text-foreground/40 hover:text-foreground"
                                    )}
                                    title="Toggle Automation"
                                >
                                    <Activity className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPairToDelete(rate.pair)}
                                    className="p-2 rounded-lg bg-white/5 text-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                    title="Remove Pair"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Base Rate Display/Input */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] uppercase font-bold text-foreground/40 tracking-wider">
                                    <span>Base Rate ({rate.pair.split('-')[1] || 'USD'})</span>
                                    {rate.is_automated && <span>Source: CoinGecko</span>}
                                </div>
                                {rate.is_automated ? (
                                    <div className="px-4 py-3 bg-black/20 rounded-xl flex justify-between items-center opacity-75">
                                        <span className="font-mono font-bold text-sm">
                                            {rate.rate.toLocaleString()} {rate.pair.split('-')[1] || 'USD'}
                                        </span>
                                        <RefreshCw className="h-3 w-3 text-foreground/20" />
                                    </div>
                                ) : (
                                    <input
                                        type="number"
                                        value={rate.manual_rate || ''}
                                        onChange={(e) => handleUpdate(rate.pair, { manual_rate: parseFloat(e.target.value) })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-500 transition-all text-amber-500 font-bold"
                                        placeholder="0.00"
                                    />
                                )}
                            </div>

                            {/* Margin Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider flex items-center gap-1.5">
                                    <Calculator className="h-3 w-3" /> Margin (%)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={rate.margin_percent}
                                        onChange={(e) => handleUpdate(rate.pair, { margin_percent: parseFloat(e.target.value) })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all font-bold"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 font-bold">%</span>
                                </div>
                            </div>

                            {/* Final Rate Calculation Display */}
                            <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                                <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Final User Price</span>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-lg text-emerald-500">
                                        {((rate.is_automated ? rate.rate : (rate.manual_rate || 0)) * (1 + rate.margin_percent / 100)).toLocaleString()} {rate.pair.split('-')[1] || 'USD'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {loading === rate.pair && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-[24px] flex items-center justify-center z-10"
                            >
                                <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>

            {rates.length === 0 && !isAdding && (
                <div className="text-center py-12 rounded-[32px] border border-dashed border-white/5 bg-white/5">
                    <Calculator className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
                    <p className="text-sm font-bold text-foreground/40">No exchange rates configured</p>
                    <button onClick={() => setIsAdding(true)} className="text-primary text-xs font-bold mt-2 hover:underline">Add BTC-USD now</button>
                </div>
            )}

            <Dialog open={!!pairToDelete} onOpenChange={() => !isDeleting && setPairToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Rate Pair?</DialogTitle>
                        <DialogDescription>
                            This will stop price tracking for {pairToDelete}. Users may not be able to trade this pair.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            onClick={() => setPairToDelete(null)}
                            className="px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/5 transition-all text-foreground/60 hover:text-foreground"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 transition-all flex items-center gap-2"
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="h-3 w-3 animate-spin" />}
                            Delete
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
