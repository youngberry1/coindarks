"use client";

import { useState } from "react";
import { AdminWallet, createAdminWallet, updateAdminWallet, deleteAdminWallet } from "@/actions/admin-wallets";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Wallet, Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface AdminWalletManagerProps {
    initialWallets: AdminWallet[];
}

export function AdminWalletManager({ initialWallets }: AdminWalletManagerProps) {
    const [wallets, setWallets] = useState<AdminWallet[]>(initialWallets);
    const [isEditing, setIsEditing] = useState<string | null>(null); // ID of wallet being edited
    const [isAdding, setIsAdding] = useState(false);

    // Delete State
    const [walletToDelete, setWalletToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        chain: '',
        currency: '',
        address: '',
        label: ''
    });

    const resetForm = () => {
        setFormData({ chain: '', currency: '', address: '', label: '' });
        setIsAdding(false);
        setIsEditing(null);
    };

    const handleCopy = async (text: string) => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                toast.success("Address copied to clipboard");
            } else {
                throw new Error("Clipboard API unavailable");
            }
        } catch (err) {
            // Fallback for older browsers or non-secure contexts
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    toast.success("Address copied (fallback)");
                    return;
                }
                throw new Error("Fallback failed");
            } catch (fallbackErr) {
                console.error("Copy failed:", err, fallbackErr);
                toast.error("Failed to copy address manually");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading(isEditing ? "Updating wallet..." : "Adding wallet...");

        try {
            if (isEditing) {
                const res = await updateAdminWallet(isEditing, formData);
                if (res.error) throw new Error(res.error);

                setWallets(prev => prev.map(w => w.id === isEditing ? { ...w, ...formData } : w));
                toast.success("Wallet updated successfully", { id: toastId });
            } else {
                const res = await createAdminWallet(formData);
                if (res.error) throw new Error(res.error);

                if (res.wallet) {
                    setWallets(prev => [res.wallet!, ...prev]);
                    toast.success("Wallet added successfully", { id: toastId });
                } else {
                    // Fallback if return type isn't updated properly yet
                    toast.success("Wallet added (refresh to see)", { id: toastId });
                }
            }
            resetForm();
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message, { id: toastId });
            } else {
                toast.error("An unknown error occurred", { id: toastId });
            }
        }
    };

    const confirmDelete = async () => {
        if (!walletToDelete) return;
        setIsDeleting(true);
        const toastId = toast.loading("Deleting wallet...");

        try {
            const res = await deleteAdminWallet(walletToDelete);

            if (res.success) {
                setWallets(prev => prev.filter(w => w.id !== walletToDelete));
                toast.success("Wallet deleted", { id: toastId });
            } else {
                throw new Error(res.error);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error(err.message, { id: toastId });
            } else {
                toast.error("Failed to delete", { id: toastId });
            }
        } finally {
            setIsDeleting(false);
            setWalletToDelete(null);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setWallets(prev => prev.map(w => w.id === id ? { ...w, is_active: !currentStatus } : w));

        const res = await updateAdminWallet(id, { is_active: !currentStatus });
        if (res.success) {
            toast.success(`Wallet ${!currentStatus ? 'activated' : 'deactivated'}`);
        } else {
            // Revert on error
            setWallets(prev => prev.map(w => w.id === id ? { ...w, is_active: currentStatus } : w));
            toast.error(res.error);
        }
    };

    const startEdit = (wallet: AdminWallet) => {
        setFormData({
            chain: wallet.chain,
            currency: wallet.currency,
            address: wallet.address,
            label: wallet.label || ''
        });
        setIsEditing(wallet.id);
        setIsAdding(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Deposit Wallets</h2>
                    <p className="text-sm text-foreground/40">Manage addresses where users send funds.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    ADD WALLET
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 overflow-hidden"
                        onSubmit={handleSubmit}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Chain</label>
                                <input
                                    required
                                    value={formData.chain}
                                    onChange={e => setFormData({ ...formData, chain: e.target.value })}
                                    placeholder="e.g. Bitcoin"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Currency Symbol</label>
                                <input
                                    required
                                    value={formData.currency}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                    placeholder="e.g. BTC"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Wallet Address</label>
                                <input
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="0x..."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Label (Optional)</label>
                                <input
                                    value={formData.label}
                                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="e.g. Cold Storage"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/5 transition-all"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                {isEditing ? 'UPDATE WALLET' : 'SAVE WALLET'}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="grid gap-4 md:grid-cols-2">
                {wallets.map((wallet) => (
                    <div key={wallet.id} className="group relative p-5 rounded-[24px] border border-white/5 bg-card-bg/50 backdrop-blur-md hover:border-primary/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-white/5">
                                    <Wallet className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">{wallet.currency} <span className="text-foreground/40 font-normal">on {wallet.chain}</span></h3>
                                    {wallet.label && <p className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md inline-block text-foreground/40 font-medium mt-1">{wallet.label}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "w-2 h-2 rounded-full",
                                        wallet.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500"
                                    )}
                                />
                            </div>
                        </div>

                        <div className="bg-black/20 rounded-xl p-3 mb-4 group-hover:bg-black/30 transition-colors">
                            <p className="font-mono text-[10px] text-foreground/60 break-all">{wallet.address}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleCopy(wallet.address)}
                                className="p-2 rounded-lg hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors"
                                title="Copy"
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => startEdit(wallet)}
                                className="p-2 rounded-lg hover:bg-white/10 text-foreground/40 hover:text-primary transition-colors"
                                title="Edit"
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => handleToggleActive(wallet.id, wallet.is_active)}
                                className={cn(
                                    "p-2 rounded-lg hover:bg-white/10 transition-colors text-[10px] font-bold uppercase tracking-wider px-3",
                                    wallet.is_active ? "text-emerald-500" : "text-rose-500"
                                )}
                            >
                                {wallet.is_active ? 'Active' : 'Inactive'}
                            </button>
                            <div className="flex-1" />
                            <button
                                onClick={() => setWalletToDelete(wallet.id)}
                                className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500/40 hover:text-rose-500 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {wallets.length === 0 && !isAdding && (
                <div className="text-center py-12 rounded-[32px] border border-dashed border-white/5 bg-white/2">
                    <Wallet className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
                    <p className="text-sm font-bold text-foreground/40">No admin wallets configured</p>
                    <button onClick={() => setIsAdding(true)} className="text-primary text-xs font-bold mt-2 hover:underline">Add one now</button>
                </div>
            )}

            <Dialog open={!!walletToDelete} onOpenChange={() => !isDeleting && setWalletToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Wallet?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. Users will no longer be able to copy this address for deposits.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            onClick={() => setWalletToDelete(null)}
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
