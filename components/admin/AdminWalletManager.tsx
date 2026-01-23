"use client";

import { useState } from "react";
import { AdminWallet, createAdminWallet, updateAdminWallet, deleteAdminWallet } from "@/actions/admin-wallets";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Wallet, Copy, Loader2, CheckCircle2, Shield, Globe, Banknote, Landmark, Activity, Users } from "lucide-react";
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
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [walletToDelete, setWalletToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        chain: '',
        currency: '',
        address: '',
        label: ''
    });

    const [walletType, setWalletType] = useState<'CRYPTO' | 'FIAT'>('CRYPTO');

    const [fiatData, setFiatData] = useState({
        provider: '',
        accountNumber: '',
        accountName: '',
        currency: 'GHS'
    });

    const resetForm = () => {
        setFormData({ chain: '', currency: '', address: '', label: '' });
        setFiatData({ provider: '', accountNumber: '', accountName: '', currency: 'GHS' });
        setIsAdding(false);
        setIsEditing(null);
    };

    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Address Copied");
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            toast.error("Capture Failed");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading(isEditing ? "UPDATING SETTINGS..." : "ADDING ADDRESS...");

        try {
            const finalData = { ...formData };

            if (walletType === 'FIAT') {
                finalData.chain = 'BANK';
                finalData.currency = fiatData.currency;
                finalData.address = `${fiatData.provider} - ${fiatData.accountNumber} (${fiatData.accountName})`;
                finalData.label = 'Institutional Fiat Account';
            }

            if (isEditing) {
                const res = await updateAdminWallet(isEditing, finalData);
                if (res.error) throw new Error(res.error);
                setWallets(prev => prev.map(w => w.id === isEditing ? { ...w, ...finalData } : w));
                toast.success("Address Updated", { id: toastId });
            } else {
                const res = await createAdminWallet(finalData);
                if (res.error) throw new Error(res.error);
                if (res.wallet) {
                    setWallets(prev => [res.wallet!, ...prev]);
                    toast.success("Address Added", { id: toastId });
                }
            }
            resetForm();
        } catch (err) {
            const error = err as Error;
            toast.error(error.message || "Sequence Failed", { id: toastId });
        }
    };

    const confirmDelete = async () => {
        if (!walletToDelete) return;
        setIsDeleting(true);
        const toastId = toast.loading("REMOVING ADDRESS...");

        try {
            const res = await deleteAdminWallet(walletToDelete);
            if (res.success) {
                setWallets(prev => prev.filter(w => w.id !== walletToDelete));
                toast.success("Address Removed", { id: toastId });
            } else throw new Error(res.error);
        } catch (err) {
            const error = err as Error;
            toast.error(error.message || "Termination Failed", { id: toastId });
        } finally {
            setIsDeleting(false);
            setWalletToDelete(null);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        setWallets(prev => prev.map(w => w.id === id ? { ...w, is_active: !currentStatus } : w));
        const res = await updateAdminWallet(id, { is_active: !currentStatus });
        if (res.success) {
            toast.success(`Address ${!currentStatus ? 'Activated' : 'Suspended'}`);
        } else {
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
        if (wallet.chain === 'BANK') setWalletType('FIAT');
        else setWalletType('CRYPTO');
    };

    return (
        <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Header Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
                <div className="space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Global Deposit Addresses</h2>
                    </div>
                    <p className="text-[11px] sm:text-sm text-foreground/40 font-medium">Configure addresses where members will send funds.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="group relative h-12 sm:h-16 px-6 sm:px-10 rounded-[16px] sm:rounded-[28px] bg-primary text-white flex items-center justify-center gap-3 sm:gap-4 shadow-2xl shadow-primary/30 active:scale-95 transition-all overflow-hidden shrink-0"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5 relative z-10" />
                    <span className="text-[9px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] relative z-10 whitespace-nowrap">
                        {isAdding ? "Close" : "Add New Address"}
                    </span>
                </button>
            </div>

            {/* Addition / Edit Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="p-5 sm:p-10 rounded-[24px] sm:rounded-[48px] glass border border-white/5 space-y-8 sm:space-y-10 shadow-3xl"
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex gap-1 p-1 sm:p-2 bg-white/5 rounded-[18px] sm:rounded-[32px] border border-white/5 w-full sm:w-fit">
                                <button
                                    type="button"
                                    onClick={() => setWalletType('CRYPTO')}
                                    className={cn(
                                        "flex-1 sm:flex-none px-4 sm:px-8 h-10 sm:h-12 rounded-[14px] sm:rounded-[24px] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all relative z-10",
                                        walletType === 'CRYPTO' ? "bg-primary text-white shadow-lg" : "text-foreground/30 hover:text-foreground"
                                    )}
                                >
                                    Crypto Matrix
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWalletType('FIAT')}
                                    className={cn(
                                        "flex-1 sm:flex-none px-4 sm:px-8 h-10 sm:h-12 rounded-[14px] sm:rounded-[24px] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all relative z-10",
                                        walletType === 'FIAT' ? "bg-primary text-white shadow-lg" : "text-foreground/30 hover:text-foreground"
                                    )}
                                >
                                    Bank / Mobile Money
                                </button>
                            </div>

                            <div className="flex items-center gap-2.5 sm:gap-3 text-foreground/20">
                                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Adding New Address</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {walletType === 'CRYPTO' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 ml-4">
                                            <Globe className="h-3.5 w-3.5 text-foreground/20" />
                                            <label className="text-[9px] sm:text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] ml-1">Network (e.g. BEP20)</label>
                                        </div>
                                        <input
                                            required
                                            value={formData.chain}
                                            onChange={e => setFormData({ ...formData, chain: e.target.value })}
                                            placeholder="MAINNET / BEP20 / ERC20"
                                            className="w-full h-13 sm:h-18 bg-white/3 border border-white/5 rounded-[16px] sm:rounded-[28px] px-5 sm:px-8 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all placeholder:text-foreground/10"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 ml-4">
                                            <Activity className="h-3.5 w-3.5 text-foreground/20" />
                                            <label className="text-[9px] sm:text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] ml-1">Asset Symbol</label>
                                        </div>
                                        <input
                                            required
                                            value={formData.currency}
                                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                            placeholder="BTC / ETH / USDT"
                                            className="w-full h-13 sm:h-18 bg-white/3 border border-white/5 rounded-[16px] sm:rounded-[28px] px-5 sm:px-8 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all placeholder:text-foreground/10"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="flex items-center gap-2 ml-4">
                                            <Wallet className="h-3.5 w-3.5 text-foreground/20" />
                                            <label className="text-[9px] sm:text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] ml-1">Wallet Address</label>
                                        </div>
                                        <input
                                            required
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="MASTER ENDPOINT ADDRESS..."
                                            className="w-full h-13 sm:h-18 bg-white/3 border border-white/5 rounded-[16px] sm:rounded-[28px] px-5 sm:px-8 text-[10px] sm:text-xs font-black tracking-widest focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all font-mono placeholder:text-foreground/10"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 ml-4">
                                            <Landmark className="h-3.5 w-3.5 text-foreground/20" />
                                            <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Bank / Provider Name</label>
                                        </div>
                                        <input
                                            required
                                            value={fiatData.provider}
                                            onChange={e => setFiatData({ ...fiatData, provider: e.target.value })}
                                            placeholder="GT BANK / ACCESS / Kuda"
                                            className="w-full h-14 sm:h-18 bg-white/3 border border-white/5 rounded-[20px] sm:rounded-[28px] px-6 sm:px-8 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all placeholder:text-foreground/10"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 ml-4">
                                            <Banknote className="h-3.5 w-3.5 text-foreground/20" />
                                            <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Fiat Currency</label>
                                        </div>
                                        <input
                                            required
                                            value={fiatData.currency}
                                            onChange={e => setFiatData({ ...fiatData, currency: e.target.value })}
                                            placeholder="GHS / NGN"
                                            className="w-full h-14 sm:h-18 bg-white/3 border border-white/5 rounded-[20px] sm:rounded-[28px] px-6 sm:px-8 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all placeholder:text-foreground/10"
                                        />
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 ml-4">
                                                <Activity className="h-3.5 w-3.5 text-foreground/20" />
                                                <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Account Number</label>
                                            </div>
                                            <input
                                                required
                                                value={fiatData.accountNumber}
                                                onChange={e => setFiatData({ ...fiatData, accountNumber: e.target.value })}
                                                placeholder="10-DIGIT IDENTIFIER..."
                                                className="w-full h-14 sm:h-18 bg-white/3 border border-white/5 rounded-[20px] sm:rounded-[28px] px-6 sm:px-8 text-[10px] sm:text-xs font-black tracking-[0.2em] sm:tracking-[0.4em] focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all font-mono placeholder:text-foreground/10"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 ml-4">
                                                <Users className="h-3.5 w-3.5 text-foreground/20" />
                                                <label className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Account Name</label>
                                            </div>
                                            <input
                                                required
                                                value={fiatData.accountName}
                                                onChange={e => setFiatData({ ...fiatData, accountName: e.target.value })}
                                                placeholder="AUTHORIZED ENTITY NAME..."
                                                className="w-full h-14 sm:h-18 bg-white/3 border border-white/5 rounded-[20px] sm:rounded-[28px] px-6 sm:px-8 text-[10px] sm:text-xs font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all placeholder:text-foreground/10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="h-13 sm:h-16 px-8 sm:px-10 rounded-[16px] sm:rounded-[28px] glass border border-white/5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:bg-white/5 transition-all text-foreground/40"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="h-13 sm:h-16 px-8 sm:px-10 rounded-[16px] sm:rounded-[28px] bg-emerald-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {isEditing ? 'Save Changes' : 'Add New Address'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Wallets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <AnimatePresence mode="popLayout">
                    {wallets.map((wallet) => (
                        <motion.div
                            key={wallet.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] border border-white/5 glass hover:border-primary/30 transition-all duration-500 shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-primary/2 dark:bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[24px] sm:rounded-[40px]" />

                            <div className="relative z-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4 sm:gap-5">
                                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-[16px] sm:rounded-[20px] bg-white/5 border border-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 shrink-0">
                                            {wallet.chain === 'BANK' ? <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> : <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-base sm:text-lg uppercase tracking-tight leading-none mb-1 sm:mb-1.5">{wallet.currency}</h3>
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-foreground/30">{wallet.chain === 'BANK' ? 'Bank & Mobile Money' : wallet.chain}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleActive(wallet.id, wallet.is_active)}
                                        className={cn(
                                            "h-9 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] border transition-all duration-300",
                                            wallet.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                        )}
                                    >
                                        {wallet.is_active ? 'Online' : 'Offline'}
                                    </button>
                                </div>

                                <div className="p-4 sm:p-6 rounded-xl sm:rounded-3xl bg-white/3 border border-white/5 space-y-2 group/addr relative overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover/addr:opacity-100 transition-opacity" />
                                    <p className="relative z-10 font-mono text-[9px] sm:text-[10px] text-foreground/40 break-all leading-relaxed sm:line-clamp-2 uppercase font-black tracking-widest sm:tracking-widest">{wallet.address}</p>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <button
                                            onClick={() => handleCopy(wallet.address, wallet.id)}
                                            className="h-10 w-10 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 text-foreground/20 hover:text-primary transition-all flex items-center justify-center active:scale-90"
                                            title="Copy Address"
                                        >
                                            {copiedId === wallet.id ? <CheckCircle2 className="h-4 w-4 sm:h-4 sm:w-4 text-emerald-500" /> : <Copy className="h-4 w-4 sm:h-4 sm:w-4" />}
                                        </button>
                                        <button
                                            onClick={() => startEdit(wallet)}
                                            className="h-10 w-10 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 text-foreground/20 hover:text-primary transition-all flex items-center justify-center active:scale-90"
                                            title="Edit Details"
                                        >
                                            <Edit2 className="h-4 w-4 sm:h-4 sm:w-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setWalletToDelete(wallet.id)}
                                        className="h-10 w-10 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 text-foreground/20 hover:text-rose-500 hover:border-rose-500/20 transition-all flex items-center justify-center active:scale-90"
                                        title="Delete Address"
                                    >
                                        <Trash2 className="h-4 w-4 sm:h-4 sm:w-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {wallets.length === 0 && !isAdding && (
                    <div className="col-span-full py-16 sm:py-24 rounded-[24px] sm:rounded-[48px] border border-dashed border-white/5 bg-white/2 flex flex-col items-center justify-center space-y-5 sm:space-y-6">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[24px] sm:rounded-[32px] bg-white/5 flex items-center justify-center border border-white/5 text-foreground/10">
                            <Wallet className="h-8 w-8 sm:h-10 sm:w-10" />
                        </div>
                        <div className="text-center space-y-1 sm:space-y-2">
                            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">No Addresses found</h3>
                            <p className="text-[11px] sm:text-sm text-foreground/30 font-medium">No deposit addresses have been added yet.</p>
                        </div>
                        <button onClick={() => setIsAdding(true)} className="text-primary text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] hover:scale-105 transition-transform">Add Your First Address</button>
                    </div>
                )}
            </div>

            <Dialog open={!!walletToDelete} onOpenChange={() => !isDeleting && setWalletToDelete(null)}>
                <DialogContent className="rounded-[40px] glass border-white/10 p-10 max-w-lg">
                    <DialogHeader className="space-y-4">
                        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                            <Trash2 className="h-8 w-8" />
                        </div>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tight">Delete Address?</DialogTitle>
                        <DialogDescription className="text-foreground/40 font-medium leading-relaxed">
                            This will remove this deposit address from the platform.
                            Members will no longer see this as a payment destination.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button
                            onClick={() => setWalletToDelete(null)}
                            className="flex-1 h-16 rounded-2xl glass border border-white/5 text-[10px] font-black uppercase tracking-[0.2em]"
                            disabled={isDeleting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="flex-2 h-16 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-rose-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Delete Address
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
