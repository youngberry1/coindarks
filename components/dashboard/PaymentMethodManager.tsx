"use client";

import { useState } from "react";
import {
    Plus,
    Trash2,
    Landmark, // Bank
    Smartphone, // Phone
    AlertCircle
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addPaymentMethod, deletePaymentMethod, PaymentMethod } from "@/actions/payment-methods";
import { toast } from "sonner";
import { Loading } from "@/components/ui/Loading";
import { AnimatePresence, motion } from "framer-motion";

interface PaymentMethodManagerProps {
    initialMethods: PaymentMethod[];
}

const PROVIDERS = {
    BANK_ACCOUNT: ["GTBank", "Access Bank", "Zenith Bank", "UBA", "First Bank", "Fidelity Bank", "Standard Chartered", "Ecobank", "CalBank", "Other"],
    MOBILE_MONEY: ["MTN Mobile Money", "Telecel Cash", "ATMoney"]
};

export function PaymentMethodManager({ initialMethods }: PaymentMethodManagerProps) {
    const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Form state
    const [form, setForm] = useState<{
        method_type: 'BANK_ACCOUNT' | 'MOBILE_MONEY';
        provider: string;
        account_number: string;
        account_name: string;
    }>({
        method_type: 'MOBILE_MONEY',
        provider: "",
        account_number: "",
        account_name: ""
    });

    const handleSave = async () => {
        if (!form.provider) {
            toast.error("Please select a provider");
            return;
        }
        if (!form.account_number) {
            toast.error("Please enter account number");
            return;
        }
        if (!form.account_name) {
            toast.error("Please enter account name");
            return;
        }

        setIsSaving(true);
        const promise = addPaymentMethod(form);

        toast.promise(promise, {
            loading: 'Saving payment method...',
            success: (data) => {
                if (data.error) throw new Error(data.error);

                // Optimistic Update (since we revalidatePath on server, we could verify id)
                // But for now let's just create a temp one or refresh page logic
                // Actually addPaymentMethod revalidates path, so page refresh or fetch update needed if simple
                // Since this is client component accessing props from server, we might need router.refresh() 
                // Or simply append to state optimistically.
                const newMethod: PaymentMethod = {
                    id: Math.random().toString(), // Temp ID until refresh
                    ...form,
                    is_default: false
                };
                setMethods(prev => [newMethod, ...prev]);

                setIsAdding(false);
                setForm({
                    method_type: 'MOBILE_MONEY',
                    provider: "",
                    account_number: "",
                    account_name: ""
                });
                return "Payment method saved";
            },
            error: (err) => err.message || 'Failed to save',
        });

        try {
            await promise;
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            const result = await deletePaymentMethod(id);
            if (result.success) {
                toast.success("Payment method removed");
                setMethods(prev => prev.filter(m => m.id !== id));
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Failed to delete");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-8">
            <AnimatePresence>
                {isSaving && <Loading message="Verifying account details..." />}
                {isDeleting && <Loading message="Removing payment method..." />}
            </AnimatePresence>

            {/* Header + Add Button */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Your Saved Accounts</p>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Payment Method
                    </button>
                )}
            </div>

            {/* Add Form */}
            {isAdding && (
                <div className="p-6 md:p-8 rounded-[32px] border border-primary/20 bg-primary/5 space-y-6 animate-in zoom-in-95 duration-300 shadow-sm dark:shadow-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Type</label>
                            <div className="flex p-1 bg-card-bg/20 border border-border rounded-xl">
                                <button
                                    onClick={() => setForm({ ...form, method_type: 'MOBILE_MONEY', provider: "" })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.method_type === 'MOBILE_MONEY' ? 'bg-primary text-white shadow-lg' : 'text-foreground/50 hover:text-foreground'}`}
                                >
                                    Mobile Money
                                </button>
                                <button
                                    onClick={() => setForm({ ...form, method_type: 'BANK_ACCOUNT', provider: "" })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.method_type === 'BANK_ACCOUNT' ? 'bg-primary text-white shadow-lg' : 'text-foreground/50 hover:text-foreground'}`}
                                >
                                    Bank Account
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Provider</label>
                            <Select
                                value={PROVIDERS[form.method_type].includes(form.provider) ? form.provider : (form.method_type === 'BANK_ACCOUNT' && form.provider ? "Other" : "")}
                                onValueChange={(val) => {
                                    if (val === "Other") {
                                        setForm({ ...form, provider: "" });
                                    } else {
                                        setForm({ ...form, provider: val });
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full bg-card-bg/20 border-border h-[42px] rounded-xl font-bold text-sm outline-none focus:ring-primary/20 focus:border-primary transition-all">
                                    <SelectValue placeholder={`Select ${form.method_type === 'MOBILE_MONEY' ? 'Network' : 'Bank'}`} />
                                </SelectTrigger>
                                <SelectContent className="bg-card-bg border-border backdrop-blur-xl">
                                    {PROVIDERS[form.method_type].map(p => (
                                        <SelectItem key={p} value={p} className="font-bold cursor-pointer hover:bg-primary/10 transition-colors">
                                            {p}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Manual Bank Entry */}
                            {form.method_type === 'BANK_ACCOUNT' && (!PROVIDERS.BANK_ACCOUNT.includes(form.provider) || form.provider === "") && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="pt-2"
                                >
                                    <input
                                        value={form.provider}
                                        onChange={(e) => setForm({ ...form, provider: e.target.value })}
                                        placeholder="Enter Bank Name..."
                                        className="w-full bg-card-bg/20 border border-border px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-primary transition-all placeholder:text-foreground/20"
                                        autoFocus
                                    />
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Account Number</label>
                            <input
                                value={form.account_number}
                                onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                                placeholder="e.g. 0244123456"
                                className="w-full bg-card-bg/20 border border-border px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-primary transition-all placeholder:text-foreground/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Account Name</label>
                            <input
                                value={form.account_name}
                                onChange={(e) => setForm({ ...form, account_name: e.target.value })}
                                placeholder="e.g. John Doe"
                                className="w-full bg-card-bg/20 border border-border px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-primary transition-all placeholder:text-foreground/20"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-start gap-4 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="h-4 w-4" /> Save Account
                        </button>
                        <button
                            onClick={() => setIsAdding(false)}
                            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-card-bg border border-border text-foreground/40 hover:text-foreground font-bold text-sm transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {methods.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border rounded-[40px] bg-card-bg/5 shadow-inner dark:shadow-none">
                        <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center text-foreground/10">
                            <Landmark className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="font-bold text-lg opacity-40">No payment methods saved</p>
                            <p className="text-sm text-foreground/20 max-w-xs mx-auto">Add bank accounts or mobile money wallets to receive payments when selling crypto.</p>
                        </div>
                    </div>
                ) : (
                    methods.map((method) => (
                        <div
                            key={method.id}
                            className="group p-5 md:p-6 rounded-[32px] border border-border bg-card-bg/50 hover:bg-card-bg shadow-sm dark:shadow-none transition-all flex flex-col sm:flex-row sm:items-center gap-6"
                        >
                            <div className="flex items-center gap-4 shrink-0 min-w-0">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-lg text-primary shrink-0">
                                    {method.method_type === 'BANK_ACCOUNT' ? <Landmark className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-black text-sm tracking-tight truncate">{method.provider}</p>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mt-1 truncate">
                                        {method.method_type === 'BANK_ACCOUNT' ? 'Bank Transfer' : 'Mobile Money'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0 bg-white/2 rounded-2xl p-4 sm:p-0 sm:bg-transparent">
                                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-1">Account Details</p>
                                <p className="font-mono text-xs sm:text-sm truncate text-foreground/80">{method.account_name}</p>
                                <p className="font-mono text-xs sm:text-sm truncate text-foreground/60">{method.account_number}</p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    onClick={() => handleDelete(method.id)}
                                    disabled={isDeleting === method.id}
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
                        These accounts will be used to send you fiat currency when you <span className="text-secondary font-bold uppercase tracking-widest text-[10px] ml-1">Sell Crypto</span>. Ensure the name matches your KYC documents.
                    </p>
                </div>
            </div>
        </div>
    );
}
