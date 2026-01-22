"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRateConfig, createRatePair, deleteRatePair, ExchangeRate } from "@/actions/rates";
import { toast } from "sonner";
import { Plus, RefreshCw, Calculator, DollarSign, Activity, Trash2, Loader2, Info, Hand, TrendingUp } from "lucide-react";
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
    const router = useRouter();
    const [rates, setRates] = useState<ExchangeRate[]>(initialRates);
    const [newPair, setNewPair] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);

    // Delete State
    const [pairToDelete, setPairToDelete] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUpdate = async (pair: string, changes: Partial<ExchangeRate>) => {
        setLoading(pair);
        // Optimistic update
        setRates(prev => prev.map(r => r.pair === pair ? { ...r, ...changes } : r));

        const res = await updateRateConfig(pair, {
            manual_rate: changes.manual_rate === null ? undefined : changes.manual_rate,
            buy_margin: changes.buy_margin,
            sell_margin: changes.sell_margin,
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
                    <p className="text-sm text-foreground/40">Manage independent Buy/Sell profit margins.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 text-foreground rounded-xl font-bold text-xs hover:bg-white/10 transition-all border border-white/5"
                >
                    <Plus className="w-4 h-4" />
                    ADD PAIR
                </button>
                <button
                    onClick={handleRefresh}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                    <RefreshCw className={cn("h-4 w-4 transition-all", isRefreshing && "animate-spin text-primary")} />
                </button>
            </div>

            {/* Admin Guidance / Help Section */}
            <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Info className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider">Split Margin Logic</h3>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest leading-none mt-1">You can now set different margins for buying and selling</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                            <TrendingUp className="h-3 w-3" /> Buy Margin (User Buys)
                        </div>
                        <p className="text-xs text-foreground/60 leading-relaxed font-medium">
                            Added to the base rate. <br />
                            Price = <span className="text-foreground">Base × (1 + Buy%)</span>
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500">
                            <Calculator className="h-3 w-3" /> Sell Margin (User Sells)
                        </div>
                        <p className="text-xs text-foreground/60 leading-relaxed font-medium">
                            Subtracted from the base rate. <br />
                            Price = <span className="text-foreground">Base × (1 - Sell%)</span>
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
                                        "px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-bold border",
                                        rate.is_automated
                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                                            : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                                    )}
                                    title="Toggle Automation"
                                >
                                    {rate.is_automated ? (
                                        <>
                                            <Activity className="h-3.5 w-3.5" />
                                            <span>Auto</span>
                                        </>
                                    ) : (
                                        <>
                                            <Hand className="h-3.5 w-3.5" />
                                            <span>Manual</span>
                                        </>
                                    )}
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
                                    <SafeNumericInput
                                        value={rate.manual_rate || 0}
                                        onChange={(val) => handleUpdate(rate.pair, { manual_rate: val })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-500 transition-all text-amber-500 font-bold"
                                        placeholder="0.00"
                                    />
                                )}
                            </div>

                            {/* Two Margins Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Buy %</label>
                                    <div className="relative">
                                        <SafeNumericInput
                                            value={rate.buy_margin || 0}
                                            onChange={(val) => handleUpdate(rate.pair, { buy_margin: val })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-3 pr-7 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-all font-bold"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/20 font-bold text-[10px]">%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Sell %</label>
                                    <div className="relative">
                                        <SafeNumericInput
                                            value={rate.sell_margin || 0}
                                            onChange={(val) => handleUpdate(rate.pair, { sell_margin: val })}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-3 pr-7 py-2 text-xs font-mono focus:outline-none focus:border-rose-500 transition-all font-bold"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/20 font-bold text-[10px]">%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Final Rate Calculation Display */}
                            <div className="pt-4 border-t border-white/5 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">User Buys</span>
                                    <p className="font-mono font-bold text-sm text-foreground">
                                        {((rate.is_automated ? rate.rate : (rate.manual_rate || 0)) * (1 + rate.buy_margin / 100)).toLocaleString()} {rate.pair.split('-')[1] || 'USD'}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">User Sells</span>
                                    <p className="font-mono font-bold text-sm text-foreground">
                                        {((rate.is_automated ? rate.rate : (rate.manual_rate || 0)) * (1 - rate.sell_margin / 100)).toLocaleString()} {rate.pair.split('-')[1] || 'USD'}
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

/**
 * A custom numeric input that handles its own local string state.
 * This allows typing negative signs (-) and leading zeros without them being stripped by React's controlled state.
 */
function SafeNumericInput({ value, onChange, className, placeholder }: { value: number; onChange: (v: number) => void; className?: string; placeholder?: string }) {
    const [localValue, setLocalValue] = useState(value.toString());
    const [prevValue, setPrevValue] = useState(value);

    // Adjust state when props change (React pattern for sync)
    if (value !== prevValue) {
        setLocalValue(value.toString());
        setPrevValue(value);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalValue(val);

        // Notify parent of valid numerical changes
        const parsed = parseFloat(val);
        if (!isNaN(parsed)) {
            onChange(parsed);
        } else if (val === "" || val === "-") {
            // If input is empty or just a negative sign, treat as 0 for the parent's state
            onChange(0);
        }
    };

    return (
        <input
            type="text"
            value={localValue}
            onChange={handleChange}
            className={className}
            placeholder={placeholder}
        />
    );
}
