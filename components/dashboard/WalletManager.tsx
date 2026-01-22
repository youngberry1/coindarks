"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Trash2,
    AlertCircle
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { saveWallet, deleteWallet } from "@/actions/wallets";
import { toast } from "sonner";
import { Loading } from "@/components/ui/Loading";
import { AnimatePresence } from "framer-motion";

interface Wallet {
    name: string;
    asset: string;
    address: string;
    network: string;
}

interface WalletManagerProps {
    initialWallets: Wallet[];
    assets: string[];
}

const NETWORK_OPTIONS: Record<string, string[]> = {
    "USDT": ["TRC20 (Tron)", "ERC20 (Ethereum)", "BEP20 (BSC)", "SOL (Solana)", "Polygon", "TON"],
    "USDC": ["ERC20 (Ethereum)", "BEP20 (BSC)", "SOL (Solana)", "Polygon", "Base"],
    "BTC": ["Bitcoin Network"],
    "ETH": ["Ethereum (Mainnet)", "Arbitrum", "Optimism", "Base", "zkSync"],
    "LTC": ["Litecoin Network"],
    "XLM": ["Stellar Network"],
    "SOL": ["Solana Network"],
};

export function WalletManager({ initialWallets, assets }: WalletManagerProps) {
    const router = useRouter();
    const [wallets, setWallets] = useState<Wallet[]>(initialWallets);
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Form state for new/editing wallet
    const [form, setForm] = useState<Wallet>({
        name: "",
        asset: assets[0] || "",
        network: NETWORK_OPTIONS[assets[0]]?.[0] || "Native",
        address: ""
    });

    const [editingWallet, setEditingWallet] = useState<string | null>(null);

    // Sync state with props when data is re-fetched via router.refresh()
    useEffect(() => {
        setWallets(initialWallets);
    }, [initialWallets]);

    const handleSave = async () => {
        console.log("HandleSave triggered. Form state:", form);
        if (!form.name) {
            toast.error("Please enter a name for this wallet");
            return;
        }
        if (!form.address) {
            toast.error("Please enter a wallet address");
            return;
        }
        if (!form.asset) {
            toast.error("Please select an asset");
            return;
        }

        setIsSaving(true);
        const promise = saveWallet(form.asset, form.address, form.network, form.name);

        toast.promise(promise, {
            loading: 'Saving wallet address...',
            success: (data) => {
                if (data.error) throw new Error(data.error);

                setIsAdding(false);
                setEditingWallet(null);
                setForm({ name: "", asset: assets[0] || "", network: NETWORK_OPTIONS[assets[0]]?.[0] || "Native", address: "" });

                // Refresh router to get updated data from server
                router.refresh();

                return data.success;
            },
            error: (err) => err.message || 'Failed to save wallet',
        });

        try {
            await promise;
        } catch (error) {
            console.error("Save wallet error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (wallet: Wallet) => {
        setForm(wallet);
        setEditingWallet(wallet.name);
        setIsAdding(true);
    };

    const handleDelete = async (wallet: Wallet) => {
        const deleteKey = `${wallet.asset}-${wallet.network}-${wallet.name}`;
        setIsDeleting(deleteKey);
        try {
            const result = await deleteWallet(wallet.asset, wallet.network, wallet.name);
            if (result.success) {
                toast.success(result.success);
                router.refresh(); // Sync with server data
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
        <div className="space-y-8">
            <AnimatePresence>
                {isSaving && (
                    <Loading message="Encrypting wallet metadata..." />
                )}
                {isDeleting && (
                    <Loading message="Purging secure records..." />
                )}
            </AnimatePresence>
            {/* Header + Add Button */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Your Saved Addresses</p>
                {!isAdding && (
                    <button
                        onClick={() => {
                            setIsAdding(true);
                            setEditingWallet(null);
                            setForm({ name: "", asset: assets[0] || "", network: NETWORK_OPTIONS[assets[0]]?.[0] || "Native", address: "" });
                        }}
                        className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add New Network
                    </button>
                )}
            </div>

            {/* Add Wallet Form */}
            {isAdding && (
                <div className="p-6 md:p-8 rounded-[32px] border border-primary/20 bg-primary/5 space-y-6 animate-in zoom-in-95 duration-300 shadow-sm dark:shadow-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 md:gap-6">
                        <div className="space-y-2 lg:col-span-3">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Wallet Name</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. My Binance Wallet"
                                className="w-full bg-card-bg/20 border border-border px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-primary transition-all placeholder:text-foreground/20"
                            />
                        </div>

                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Asset</label>
                            <Select
                                value={form.asset}
                                onValueChange={(val) => {
                                    setForm({
                                        ...form,
                                        asset: val,
                                        network: NETWORK_OPTIONS[val]?.[0] || "Native"
                                    });
                                }}
                            >
                                <SelectTrigger className="w-full bg-card-bg/20 border-border h-[46px] rounded-xl font-bold text-sm outline-none focus:ring-primary/20 focus:border-primary transition-all">
                                    <SelectValue placeholder="Select Asset" />
                                </SelectTrigger>
                                <SelectContent className="bg-card-bg border-border backdrop-blur-xl">
                                    {assets.map(a => (
                                        <SelectItem key={a} value={a} className="font-bold cursor-pointer hover:bg-primary/10 transition-colors">
                                            {a}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 lg:col-span-3">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Network</label>
                            <Select
                                value={form.network}
                                onValueChange={(val) => setForm({ ...form, network: val })}
                            >
                                <SelectTrigger className="w-full bg-card-bg/20 border-border h-[46px] rounded-xl font-bold text-sm outline-none focus:ring-primary/20 focus:border-primary transition-all">
                                    <SelectValue placeholder="Select Network" />
                                </SelectTrigger>
                                <SelectContent className="bg-card-bg border-border backdrop-blur-xl">
                                    {(NETWORK_OPTIONS[form.asset] || ["Native"]).map(n => (
                                        <SelectItem key={n} value={n} className="font-bold cursor-pointer hover:bg-primary/10 transition-colors">
                                            {n}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 lg:col-span-4">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Receiving Address</label>
                            <input
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="Paste your address here"
                                className="w-full bg-card-bg/20 border border-border px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-primary transition-all placeholder:text-foreground/20"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-start gap-4 pt-6">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !form.address}
                            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {editingWallet ? <Plus className="h-4 w-4 rotate-45" /> : <Plus className="h-4 w-4" />}
                            {editingWallet ? "Update Wallet Address" : "Save Wallet Address"}
                        </button>
                        <button
                            onClick={() => {
                                setIsAdding(false);
                                setEditingWallet(null);
                            }}
                            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-card-bg border border-border text-foreground/40 hover:text-foreground font-bold text-sm transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Wallets List */}
            <div className="grid grid-cols-1 gap-4">
                {wallets.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border rounded-[40px] bg-card-bg/5 shadow-inner dark:shadow-none">
                        <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center text-foreground/10">
                            <Plus className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="font-bold text-lg opacity-40">No wallets saved yet</p>
                            <p className="text-sm text-foreground/20 max-w-xs mx-auto">Add your crypto wallet addresses to use them during checkout.</p>
                        </div>
                    </div>
                ) : (
                    wallets.map((wallet) => (
                        <div
                            key={`${wallet.asset}-${wallet.network}-${wallet.name}`}
                            className="group p-5 md:p-6 rounded-[32px] border border-border bg-card-bg/50 hover:bg-card-bg shadow-sm dark:shadow-none transition-all flex flex-col sm:flex-row sm:items-center gap-6"
                        >
                            <div className="flex items-center gap-4 shrink-0 min-w-0">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-lg text-primary shrink-0">
                                    {wallet.asset}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-black text-sm tracking-tight truncate">{wallet.name}</p>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mt-1 truncate">{wallet.asset} • {wallet.network}</p>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0 bg-white/2 rounded-2xl p-4 sm:p-0 sm:bg-transparent">
                                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-1">Destination Address</p>
                                <p className="font-mono text-xs sm:text-sm truncate text-foreground/80">{wallet.address}</p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    onClick={() => handleEdit(wallet)}
                                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground/40 hover:text-foreground hover:bg-white/10 font-bold text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(wallet)}
                                    disabled={isDeleting === `${wallet.asset}-${wallet.network}-${wallet.name}`}
                                    className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all flex items-center justify-center min-w-[50px]"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Warning Section */}
            <div className="p-6 md:p-8 rounded-[40px] border border-secondary/20 bg-secondary/5 backdrop-blur-md flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-3xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-8 w-8 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-black text-lg mb-1 leading-none">Usage & Security</h4>
                    <p className="text-sm text-foreground/50 font-medium leading-relaxed max-w-2xl">
                        Only save receiving addresses where you want your funds sent after a <span className="text-secondary font-bold uppercase tracking-widest text-[10px] ml-1">Buy order</span> is processed. Ensure the <span className="text-white font-bold">Network</span> matches your wallet provider.
                    </p>
                </div>
            </div>
        </div>
    );
}

