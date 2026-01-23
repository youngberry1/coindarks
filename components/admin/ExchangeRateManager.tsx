"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRateConfig, createRatePair, deleteRatePair, ExchangeRate } from "@/actions/rates";
import { toast } from "sonner";
import { Plus, RefreshCw, Calculator, DollarSign, Activity, Trash2, Loader2, Info, Hand, TrendingUp, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
    const [pairToDelete, setPairToDelete] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        router.refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleUpdate = async (pair: string, changes: Partial<ExchangeRate>) => {
        setLoading(pair);
        setRates(prev => prev.map(r => r.pair === pair ? { ...r, ...changes } : r));

        const res = await updateRateConfig(pair, {
            manual_rate: changes.manual_rate === null ? undefined : changes.manual_rate,
            buy_margin: changes.buy_margin,
            sell_margin: changes.sell_margin,
            is_automated: changes.is_automated
        });

        if (res.error) toast.error(res.error);
        else toast.success(`Node ${pair} Updated`);
        setLoading(null);
    };

    const handleAddPair = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPair) return;

        const toastId = toast.loading("ADDING CURRENCY PAIR...");
        const res = await createRatePair(newPair.toUpperCase());

        if (res.success && res.rate) {
            toast.success("Currency Pair Added", { id: toastId });
            setRates(prev => [res.rate!, ...prev]);
            setNewPair("");
            setIsAdding(false);
        } else {
            toast.error(res.error || "Initialization Failed", { id: toastId });
        }
    };

    const confirmDelete = async () => {
        if (!pairToDelete) return;
        setIsDeleting(true);
        const toastId = toast.loading("DELETING CURRENCY PAIR...");

        try {
            const res = await deleteRatePair(pairToDelete);
            if (res.success) {
                setRates(prev => prev.filter(r => r.pair !== pairToDelete));
                toast.success("Currency Pair Deleted", { id: toastId });
            } else toast.error(res.error || "Deletion Failed", { id: toastId });
        } catch {
            toast.error("Process Error", { id: toastId });
        } finally {
            setIsDeleting(false);
            setPairToDelete(null);
        }
    };

    return (
        <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header / Stats Focus */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
                <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Exchange Rates</h2>
                    </div>
                    <p className="text-[11px] sm:text-sm text-foreground/40 font-medium">Manage currency conversion rates and profit margins.</p>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-4">
                    <button
                        onClick={handleRefresh}
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-[14px] sm:rounded-2xl glass border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all group active:scale-95 shadow-xl shrink-0"
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5 sm:h-5 sm:w-5 opacity-40 group-hover:opacity-100 transition-all group-hover:rotate-180 duration-700", isRefreshing && "animate-spin text-primary opacity-100")} />
                    </button>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="h-10 sm:h-12 px-4 sm:px-6 rounded-[14px] sm:rounded-2xl bg-white/5 border border-white/5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95 shadow-xl flex items-center gap-2 sm:gap-3"
                    >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Add Pair</span>
                    </button>
                </div>
            </div>

            {/* Institutional Guidance */}
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/3 blur-3xl opacity-50 rounded-[28px] sm:rounded-[48px]" />
                <div className="relative p-5 sm:p-10 rounded-[24px] sm:rounded-[48px] glass border border-primary/10 overflow-hidden shadow-2xl">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 sm:gap-10">
                        <div className="space-y-3 sm:space-y-4 max-w-sm">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-[14px] sm:rounded-[20px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                                    <Info className="h-4 w-4 sm:h-7 sm:w-7 text-primary" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">Profit Margin Guide</h3>
                            </div>
                            <p className="text-[10px] sm:text-xs text-foreground/40 font-medium leading-relaxed">
                                Set your profit margins for buying and selling. The system calculates the final price automatically based on current market rates.
                            </p>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
                            <div className="p-5 sm:p-8 rounded-xl sm:rounded-3xl bg-white/3 border border-white/5 space-y-3 sm:space-y-4 shadow-xl">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2.5 sm:gap-3 text-emerald-500">
                                        <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Buy Margin</span>
                                    </div>
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                                <p className="text-[9px] sm:text-[11px] text-foreground/60 leading-relaxed font-black uppercase tracking-widest">
                                    Applied to Market Price. <br />
                                    <span className="text-white">Price = Market × (1 + Buy%)</span>
                                </p>
                            </div>

                            <div className="p-5 sm:p-8 rounded-xl sm:rounded-3xl bg-white/3 border border-white/5 space-y-3 sm:space-y-4 shadow-xl">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2.5 sm:gap-3 text-rose-500">
                                        <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Sell Margin</span>
                                    </div>
                                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                </div>
                                <p className="text-[9px] sm:text-[11px] text-foreground/60 leading-relaxed font-black uppercase tracking-widest">
                                    Applied to Market Price. <br />
                                    <span className="text-white">Price = Market × (1 - Sell%)</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Addition Matrix */}
            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        onSubmit={handleAddPair}
                        className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-5 sm:p-8 rounded-[20px] sm:rounded-[32px] glass border border-primary/20 shadow-3xl"
                    >
                        <div className="relative flex-1">
                            <Sliders className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-foreground/10" />
                            <input
                                autoFocus
                                value={newPair}
                                onChange={(e) => setNewPair(e.target.value)}
                                placeholder="E.G. BTC-USD / SOL-NGN"
                                className="w-full h-13 sm:h-16 pl-14 sm:pl-16 pr-6 sm:pr-8 bg-white/3 border border-white/5 rounded-[14px] sm:rounded-[20px] text-[10px] sm:text-xs font-black tracking-widest sm:tracking-[0.4em] uppercase focus:outline-none focus:border-primary/50 transition-all font-mono placeholder:text-foreground/5"
                            />
                        </div>
                        <button type="submit" className="h-13 sm:h-16 px-8 sm:px-12 rounded-[14px] sm:rounded-[20px] bg-primary text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-2xl shadow-primary/20 active:scale-95 transition-all">
                            Add Pair
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Pairs Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {rates.map((rate) => (
                        <motion.div
                            key={rate.pair}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] glass border border-white/5 hover:border-amber-500/30 transition-all duration-700 shadow-2xl"
                        >
                            {/* Overlay Glow */}
                            <div className="absolute inset-0 bg-amber-500/1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[48px]" />

                            <div className="relative z-10 space-y-10">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4 sm:gap-5">
                                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-[16px] sm:rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform duration-500 shrink-0">
                                            <DollarSign className="h-5 w-5 sm:h-7 sm:w-7 text-amber-500" />
                                        </div>
                                        <div className="space-y-0.5 sm:space-y-1">
                                            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter leading-none">{rate.pair}</h3>
                                            <div className="flex items-center gap-2">
                                                <div className={cn("h-1.5 w-1.5 rounded-full", rate.is_automated ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]")} />
                                                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">
                                                    {rate.is_automated ? "Direct Market Feed" : "Manual Rate"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <button
                                            onClick={() => handleUpdate(rate.pair, { is_automated: !rate.is_automated })}
                                            className={cn(
                                                "h-10 px-5 rounded-2xl flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-500",
                                                rate.is_automated
                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                            )}
                                        >
                                            {rate.is_automated ? <Activity className="h-3 w-3" /> : <Hand className="h-3 w-3" />}
                                            <span>{rate.is_automated ? "Auto" : "Manual"}</span>
                                        </button>
                                        <button onClick={() => setPairToDelete(rate.pair)} className="text-foreground/10 hover:text-rose-500 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Core Benchmark */}
                                    <div className="space-y-3">
                                        <p className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.3em] ml-2">Reference Price ({rate.pair.split('-')[1] || 'USD'})</p>
                                        {rate.is_automated ? (
                                            <div className="h-12 sm:h-16 px-5 sm:px-8 rounded-[14px] sm:rounded-[24px] bg-white/3 border border-white/5 flex items-center justify-between group/feed opacity-60">
                                                <span className="font-mono font-black text-sm sm:text-lg tracking-tight">
                                                    {rate.rate.toLocaleString()}
                                                </span>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-foreground/20 whitespace-nowrap">Source: Market Feed</span>
                                                    <RefreshCw className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-foreground/10" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative group/input">
                                                <div className="absolute inset-0 bg-amber-500/5 blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                                <SafeNumericInput
                                                    value={rate.manual_rate || 0}
                                                    onChange={(val) => handleUpdate(rate.pair, { manual_rate: val })}
                                                    className="w-full h-14 sm:h-16 px-6 sm:px-8 bg-white/3 border border-white/5 rounded-[18px] sm:rounded-[24px] font-mono font-black text-base sm:text-lg tracking-tight text-amber-500 focus:outline-none focus:border-amber-500/50 transition-all relative z-10"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Benchmarks Matrix */}
                                    <div className="grid grid-cols-2 gap-4 sm:gap-5 py-2 sm:py-4">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] ml-2">Buy Margin %</label>
                                            <div className="relative group/margin">
                                                <SafeNumericInput
                                                    value={rate.buy_margin || 0}
                                                    onChange={(val) => handleUpdate(rate.pair, { buy_margin: val })}
                                                    className="w-full h-12 sm:h-14 pl-4 sm:pl-6 pr-8 sm:pr-10 bg-white/3 border border-white/5 rounded-[16px] sm:rounded-[20px] font-mono font-black text-xs sm:text-sm tracking-widest focus:outline-none focus:border-emerald-500/50 transition-all"
                                                />
                                                <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-foreground/10 font-black text-[9px] sm:text-[10px]">%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-rose-500 uppercase tracking-[0.3em] ml-2">Sell Margin %</label>
                                            <div className="relative group/margin">
                                                <SafeNumericInput
                                                    value={rate.sell_margin || 0}
                                                    onChange={(val) => handleUpdate(rate.pair, { sell_margin: val })}
                                                    className="w-full h-12 sm:h-14 pl-4 sm:pl-6 pr-8 sm:pr-10 bg-white/3 border border-white/5 rounded-[16px] sm:rounded-[20px] font-mono font-black text-xs sm:text-sm tracking-widest focus:outline-none focus:border-rose-500/50 transition-all"
                                                />
                                                <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-foreground/10 font-black text-[9px] sm:text-[10px]">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Projected Cycles */}
                                    <div className="p-5 sm:p-8 rounded-[20px] sm:rounded-[32px] bg-white/3 border border-white/5 space-y-4 sm:space-y-5 shadow-inner">
                                        <div className="flex justify-between items-center group/result">
                                            <div className="flex items-center gap-2.5 sm:gap-3">
                                                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500/20" />
                                                <span className="text-[8px] sm:text-[9px] font-black text-foreground/20 uppercase tracking-widest">Final Buy Price</span>
                                            </div>
                                            <p className="font-mono font-black text-xs sm:text-base text-foreground group-hover/result:text-emerald-500 transition-colors">
                                                {((rate.is_automated ? rate.rate : (rate.manual_rate || 0)) * (1 + rate.buy_margin / 100)).toLocaleString()} <span className="text-[8px] sm:text-[10px] opacity-20 ml-1">{rate.pair.split('-')[1] || 'USD'}</span>
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-center group/result">
                                            <div className="flex items-center gap-2.5 sm:gap-3">
                                                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-rose-500/20" />
                                                <span className="text-[8px] sm:text-[9px] font-black text-foreground/20 uppercase tracking-widest">Final Sell Price</span>
                                            </div>
                                            <p className="font-mono font-black text-xs sm:text-base text-foreground group-hover/result:text-rose-500 transition-colors">
                                                {((rate.is_automated ? rate.rate : (rate.manual_rate || 0)) * (1 - rate.sell_margin / 100)).toLocaleString()} <span className="text-[8px] sm:text-[10px] opacity-20 ml-1">{rate.pair.split('-')[1] || 'USD'}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {loading === rate.pair && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-[48px] flex flex-col items-center justify-center z-50 space-y-6"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
                                        <RefreshCw className="h-10 w-10 text-primary animate-spin relative" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Updating Rates...</p>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {rates.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 sm:py-32 rounded-[32px] sm:rounded-[64px] border border-dashed border-white/5 bg-white/2 flex flex-col items-center justify-center space-y-6 sm:space-y-8">
                        <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-[20px] sm:rounded-[40px] bg-white/5 flex items-center justify-center border border-white/5 text-foreground/10">
                            <Sliders className="h-7 w-7 sm:h-10 sm:w-10" />
                        </div>
                        <div className="text-center space-y-2 sm:space-y-3">
                            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">No Exchange Rates Found</h3>
                            <p className="text-[11px] sm:text-sm text-foreground/30 font-medium max-w-xs leading-relaxed">No currency pairs have been added yet.</p>
                        </div>
                        <button onClick={() => setIsAdding(true)} className="h-14 sm:h-16 px-10 sm:px-12 rounded-[18px] sm:rounded-[28px] bg-primary text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 transition-all">Add Your First Pair</button>
                    </div>
                )}
            </div>

            {/* Termination Logic */}
            <Dialog open={!!pairToDelete} onOpenChange={() => !isDeleting && setPairToDelete(null)}>
                <DialogContent className="rounded-[40px] glass border-white/10 p-12 max-w-lg">
                    <DialogHeader className="space-y-6">
                        <div className="h-20 w-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                            <Trash2 className="h-10 w-10" />
                        </div>
                        <DialogTitle className="text-4xl font-black uppercase tracking-tight leading-none">Delete Currency Pair?</DialogTitle>
                        <DialogDescription className="text-lg text-foreground/40 font-medium leading-relaxed">
                            This will immediately remove the <span className="text-white font-bold">{pairToDelete}</span> pair from the market desk. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-6 mt-10">
                        <button
                            onClick={() => setPairToDelete(null)}
                            className="flex-1 h-18 rounded-[24px] glass border border-white/5 text-[10px] font-black uppercase tracking-[0.2em]"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="flex-2 h-18 rounded-[24px] bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-rose-500/20 flex items-center justify-center gap-4 disabled:opacity-50"
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                            Delete Pair
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

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
        const sanitized = val.replace(/[^0-9.-]/g, ''); // Allow only numbers, dot, and minus
        setLocalValue(sanitized);

        const parsed = parseFloat(sanitized);
        if (!isNaN(parsed)) {
            onChange(parsed);
        } else if (sanitized === "" || sanitized === "-") {
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
