"use client";

import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    Loader2
} from "lucide-react";
import { toggleInventoryStatus } from "@/actions/admin";
import { toast } from "sonner";

interface InventoryToggleCardProps {
    item: {
        asset: string;
        buy_enabled: boolean;
        sell_enabled: boolean;
        updated_at: string;
    };
}

export function InventoryToggleCard({ item }: InventoryToggleCardProps) {
    const [buyEnabled, setBuyEnabled] = useState(item.buy_enabled);
    const [sellEnabled, setSellEnabled] = useState(item.sell_enabled);
    const [isUpdatingBuy, setIsUpdatingBuy] = useState(false);
    const [isUpdatingSell, setIsUpdatingSell] = useState(false);

    const handleToggle = async (field: 'buy_enabled' | 'sell_enabled') => {
        const isBuy = field === 'buy_enabled';
        const currentValue = isBuy ? buyEnabled : sellEnabled;
        const setter = isBuy ? setBuyEnabled : setSellEnabled;
        const loadingSetter = isBuy ? setIsUpdatingBuy : setIsUpdatingSell;

        loadingSetter(true);
        try {
            const result = await toggleInventoryStatus(item.asset, field, !currentValue);
            if (result.success) {
                setter(!currentValue);
                toast.success(result.success);
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Failed to update status");
        } finally {
            loadingSetter(false);
        }
    };

    return (
        <div className="p-8 rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md hover:border-white/10 transition-all group">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                    <span className="font-black text-lg text-foreground/40 group-hover:text-primary">{item.asset[0]}</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold">{item.asset}</h3>
                    <p className="text-[10px] text-foreground/20 font-black uppercase tracking-widest">
                        Last updated: {new Date(item.updated_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Buy Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${buyEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-white/5 text-foreground/20"}`}>
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Buying</p>
                            <p className="text-[10px] text-foreground/40 font-medium">{buyEnabled ? "Active" : "Disabled"}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleToggle('buy_enabled')}
                        disabled={isUpdatingBuy}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${buyEnabled ? "bg-primary" : "bg-white/10"}`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${buyEnabled ? "translate-x-5" : "translate-x-0"}`}>
                            {isUpdatingBuy && <Loader2 className="h-3 w-3 animate-spin m-1 text-primary" />}
                        </span>
                    </button>
                </div>

                {/* Sell Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${sellEnabled ? "bg-rose-500/10 text-rose-500" : "bg-white/5 text-foreground/20"}`}>
                            <TrendingDown className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Selling</p>
                            <p className="text-[10px] text-foreground/40 font-medium">{sellEnabled ? "Active" : "Disabled"}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleToggle('sell_enabled')}
                        disabled={isUpdatingSell}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${sellEnabled ? "bg-primary" : "bg-white/10"}`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${sellEnabled ? "translate-x-5" : "translate-x-0"}`}>
                            {isUpdatingSell && <Loader2 className="h-3 w-3 animate-spin m-1 text-primary" />}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
