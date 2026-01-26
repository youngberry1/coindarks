"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Copy, Info, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCryptoAmount } from "@/lib/formatters";
import Link from "next/link";
import { useEffect, useState } from "react";

interface OrderDetailsCardProps {
    order: {
        id: string; // the database uuid
        order_number: string; // the human readable ID
        type: 'BUY' | 'SELL';
        asset: string;
        amount_crypto: number;
        amount_fiat: number;
        fiat_currency: string;
        status: string;
        created_at: string;
        receiving_address?: string; // User's address
    };
    paymentMethods?: Array<{ type: string; address: string; label?: string; network?: string }>; // Multiple payment options
    isAdmin?: boolean;
}

export function OrderDetailsCard({ order, paymentMethods = [] }: OrderDetailsCardProps) {
    const [showContactSupport, setShowContactSupport] = useState(false);

    // Track selected payment TYPE (e.g., 'BANK', 'MOMO', 'CRYPTO')
    const [selectedTypeState, setSelectedTypeState] = useState<string | null>(null);

    // Derive available types and the effective selected type
    const availableTypes = Array.from(new Set(paymentMethods.map(m => m.type)));
    const selectedType = (selectedTypeState && availableTypes.includes(selectedTypeState))
        ? selectedTypeState
        : (availableTypes[0] || 'BANK');

    const handleTypeSelect = (type: string) => {
        setSelectedTypeState(type);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const isPending = order.status === 'PENDING';
    const isCompleted = order.status === 'COMPLETED';
    const isCancelled = order.status === 'CANCELLED';

    useEffect(() => {
        if (!isPending) return;

        const checkTime = () => {
            const orderTime = new Date(order.created_at).getTime();
            const timeElapsed = Date.now() - orderTime;
            setShowContactSupport(timeElapsed > 30 * 60 * 1000); // 30 minutes
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [order.created_at, isPending]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 md:p-12 rounded-[40px] border border-white/5 bg-card-bg/50 backdrop-blur-xl text-center space-y-8 max-w-2xl mx-auto"
        >
            {/* Status Icon */}
            <div className={cn(
                "h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 animate-pulse",
                isCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                    isCancelled ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                        "bg-amber-500/10 border-amber-500/20 text-amber-500"
            )}>
                {isCompleted ? <CheckCircle2 className="h-12 w-12" /> :
                    isCancelled ? <XCircle className="h-12 w-12" /> :
                        <Clock className="h-12 w-12" />}
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-black">
                    {isCompleted ? "Exchange Successful!" :
                        isCancelled ? "Trade Cancelled" :
                            "Exchange Started!"}
                </h2>
                <p className="text-foreground/50 font-medium tracking-wide">
                    Trade <span className="text-primary font-mono font-bold">#{order.order_number}</span>
                </p>
                <span className={cn(
                    "inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border mt-2",
                    isCompleted ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        isCancelled ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                    {order.status}
                </span>
            </div>

            <div className="bg-black/20 p-6 rounded-3xl border border-white/10 space-y-4 text-left">
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4 pb-4 border-b border-white/5">
                    <div>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Date</p>
                        <p className="font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Time</p>
                        <p className="font-bold">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">You Send</p>
                        <p className="font-bold text-primary">
                            {order.type === 'BUY'
                                ? `${order.fiat_currency === 'GHS' ? 'GH₵' : '₦'}${order.amount_fiat.toLocaleString()} `
                                : `${formatCryptoAmount(order.amount_crypto, order.asset)} ${order.asset} `}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">You Receive</p>
                        <p className="font-bold text-emerald-500">
                            {order.type === 'BUY'
                                ? `${formatCryptoAmount(order.amount_crypto, order.asset)} ${order.asset} `
                                : `${order.fiat_currency === 'GHS' ? 'GH₵' : '₦'}${order.amount_fiat.toLocaleString()} `}
                        </p>
                    </div>
                </div>

                {/* Payment Logic */}
                {isPending && (
                    <>
                        {paymentMethods.length > 0 ? (
                            <>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Next Steps</p>

                                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                                        <p className="text-xs text-amber-500 font-bold">1. Send EXACTLY <span className="text-foreground">
                                            {order.type === 'BUY'
                                                ? `${order.fiat_currency === 'GHS' ? 'GH₵' : '₦'}${order.amount_fiat.toLocaleString()} `
                                                : `${formatCryptoAmount(order.amount_crypto, order.asset)} ${order.asset} `}
                                        </span></p>
                                        <p className="text-[10px] text-amber-500/80 font-medium">Sending a different amount may delay your exchange.</p>
                                    </div>

                                    {order.type === 'BUY' && (
                                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 space-y-1">
                                            <p className="text-xs font-bold">2. Add Reference Code: <span className="text-white font-mono">{order.order_number}</span></p>
                                            <p className="text-[10px] text-blue-500/80 font-medium">Enter this in the &quot;Reference&quot; or &quot;Note&quot; field of your bank app.</p>
                                        </div>
                                    )}

                                    {order.type === 'SELL' && (
                                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 space-y-1">
                                            <p className="text-xs font-bold">2. Use High/Priority Gas Fee</p>
                                            <p className="text-[10px] text-blue-500/80 font-medium">Ensure transaction confirms quickly.</p>
                                        </div>
                                    )}

                                    <p className="text-xs font-bold pt-2">{order.type === 'BUY' ? 'Payment Options:' : 'System Wallet Address:'}</p>
                                </div>

                                {/* Grouped Tabs for BUY, List for SELL */}
                                {(() => {
                                    if (order.type === 'BUY') {
                                        const uniqueTypes = Array.from(new Set(paymentMethods.map(m => m.type)));
                                        const displaysMethods = paymentMethods.filter(m => m.type === selectedType);

                                        return (
                                            <div className="space-y-4 mt-4">
                                                {uniqueTypes.length > 1 && (
                                                    <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
                                                        {uniqueTypes.map((type) => (
                                                            <button
                                                                key={type}
                                                                onClick={() => handleTypeSelect(type)}
                                                                className={cn(
                                                                    "flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                                                    selectedType === type
                                                                        ? "bg-primary text-white shadow-lg"
                                                                        : "text-foreground/40 hover:text-foreground hover:bg-white/5"
                                                                )}
                                                            >
                                                                {type === 'BANK' ? '🏦 Bank Transfer' : type === 'MOMO' ? '📱 Mobile Money' : '💳 Crypto'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="space-y-3">
                                                    {displaysMethods.map((method, idx) => (
                                                        <div key={idx} className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                            {method.label && (
                                                                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest pl-1">
                                                                    {method.label}
                                                                </p>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5 group cursor-pointer w-full hover:border-primary/20 transition-all active:scale-[0.98]"
                                                                onClick={() => copyToClipboard(method.address)}
                                                                aria-label="Copy payment details"
                                                            >
                                                                <p className={cn(
                                                                    "font-mono text-xs break-all text-foreground/80 flex-1 text-left",
                                                                    (method.type === 'BANK' || method.type === 'MOMO') && "uppercase"
                                                                )}>
                                                                    {(method.type === 'BANK' || method.type === 'MOMO')
                                                                        ? method.address.toUpperCase()
                                                                        : method.address}
                                                                </p>
                                                                <Copy className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        /* SELL (Crypto) Display */
                                        return (
                                            <div className="space-y-3 mt-4">
                                                {paymentMethods.map((method, idx) => (
                                                    <div key={idx} className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                        {method.type === 'CRYPTO' && method.network && (
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-primary/10 border border-primary/20 text-primary">
                                                                    Network: {method.network}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {method.label && (
                                                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest pl-1">
                                                                {method.label}
                                                            </p>
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5 group cursor-pointer w-full hover:border-primary/20 transition-all active:scale-[0.98]"
                                                            onClick={() => copyToClipboard(method.address)}
                                                            aria-label="Copy payment details"
                                                        >
                                                            <p className="font-mono text-xs break-all text-foreground/80 flex-1 text-left">
                                                                {method.address}
                                                            </p>
                                                            <Copy className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }
                                })()}
                            </>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                    Payment Instructions Sent to <span className="text-primary">your email</span>
                                </p>
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-amber-500 text-xs font-bold leading-relaxed">
                                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                    <p>Please wait up to 30 minutes for completion. If you need help, contact our team immediately.</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/5 mt-4">
                            <div className="p-3 rounded-xl bg-white/5 flex items-center gap-3 text-xs font-medium text-foreground/60">
                                <Clock className="h-4 w-4 animate-spin-slow" />
                                <p>Estimated completion: 5-30 Minutes</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/dashboard/orders" className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all text-sm">
                    Back to History
                </Link>

                {showContactSupport && (
                    <Link href="/dashboard/support" className="px-10 py-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all text-sm flex items-center justify-center gap-2">
                        <Info className="h-4 w-4" /> Get Help
                    </Link>
                )}
            </div>
        </motion.div>
    );
}
