"use client";

import { useState } from "react";
import {
    Plus,
    Trash2,
    Check,
    X,
    Loader2,
    AlertCircle,
    Copy
} from "lucide-react";
import { saveWallet, deleteWallet } from "@/actions/wallets";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WalletManagerProps {
    initialWallets: {
        asset: string;
        address: string;
    }[];
    assets: string[];
}

export function WalletManager({ initialWallets, assets }: WalletManagerProps) {
    const [wallets, setWallets] = useState(initialWallets);
    const [editingAsset, setEditingAsset] = useState<string | null>(null);
    const [addressInput, setAddressInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleSave = async (asset: string) => {
        if (!addressInput) return;
        setIsSaving(true);
        try {
            const result = await saveWallet(asset, addressInput);
            if (result.success) {
                toast.success(result.success);
                setWallets(prev => {
                    const existing = prev.find(w => w.asset === asset);
                    if (existing) {
                        return prev.map(w => w.asset === asset ? { ...w, address: addressInput } : w);
                    }
                    return [...prev, { asset, address: addressInput }];
                });
                setEditingAsset(null);
                setAddressInput("");
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Failed to save wallet");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (asset: string) => {
        setIsDeleting(asset);
        try {
            const result = await deleteWallet(asset);
            if (result.success) {
                toast.success(result.success);
                setWallets(prev => prev.filter(w => w.asset !== asset));
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Failed to delete wallet");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {assets.map((asset) => {
                    const wallet = wallets.find(w => w.asset === asset);
                    const isEditing = editingAsset === asset;

                    return (
                        <div
                            key={asset}
                            className={cn(
                                "group relative p-4 md:p-6 rounded-3xl md:rounded-[32px] border transition-all flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6",
                                isEditing ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10" : "border-white/5 bg-white/5 hover:border-white/10"
                            )}
                        >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 border transition-all",
                                    wallet ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/5 text-foreground/20"
                                )}>
                                    {asset}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-1">{asset} Address</p>
                                    {isEditing ? (
                                        <div className="flex items-center gap-3">
                                            <input
                                                autoFocus
                                                value={addressInput}
                                                onChange={(e) => setAddressInput(e.target.value)}
                                                placeholder={`Enter your ${asset} address`}
                                                className="w-full bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl font-bold text-sm outline-none focus:border-primary transition-all"
                                            />
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleSave(asset)}
                                                    disabled={isSaving}
                                                    className="p-2.5 rounded-xl bg-primary text-white hover:scale-105 transition-all disabled:opacity-50"
                                                >
                                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => { setEditingAsset(null); setAddressInput(""); }}
                                                    className="p-2.5 rounded-xl bg-white/10 text-foreground/40 hover:text-foreground transition-all"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <p className={cn(
                                                "font-mono text-sm truncate",
                                                wallet ? "text-foreground" : "text-foreground/10 italic"
                                            )}>
                                                {wallet?.address || `No address saved for ${asset}`}
                                            </p>
                                            {wallet && (
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(wallet.address);
                                                        toast.success("Address copied!");
                                                    }}
                                                    className="p-1.5 rounded-lg bg-white/5 text-foreground/20 hover:text-foreground transition-all"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!isEditing && (
                                <div className="flex items-center gap-3 self-end sm:self-center">
                                    {wallet ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditingAsset(asset);
                                                    setAddressInput(wallet.address);
                                                }}
                                                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground/40 hover:text-primary hover:border-primary/20 hover:bg-primary/5 font-bold text-xs transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(asset)}
                                                disabled={isDeleting === asset}
                                                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground/20 hover:text-rose-500 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all"
                                            >
                                                {isDeleting === asset ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingAsset(asset);
                                                setAddressInput("");
                                            }}
                                            className="px-6 py-2.5 rounded-xl bg-secondary text-white font-bold text-xs shadow-lg shadow-secondary/20 hover:scale-105 transition-all flex items-center gap-2"
                                        >
                                            <Plus className="h-4 w-4" /> Add Address
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="p-5 md:p-8 rounded-3xl md:rounded-[40px] border border-secondary/20 bg-secondary/5 backdrop-blur-md flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="h-16 w-16 rounded-3xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-8 w-8 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-black text-lg mb-1">Security Warning</h4>
                    <p className="text-sm text-foreground/50 font-medium leading-relaxed max-w-2xl">
                        CoinDarks will never ask for your private keys or seed phrases. Only save receiving addresses where you want your funds to be sent after a <span className="text-secondary font-bold">Buy order</span> is completed.
                    </p>
                </div>
            </div>
        </div>
    );
}
