"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Copy, Info, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
    depositAddress?: string; // Admin's address to pay to (for BUY) or send to (for SELL)
    isAdmin?: boolean;
}

export function OrderDetailsCard({ order, depositAddress }: OrderDetailsCardProps) {
    const [showContactSupport, setShowContactSupport] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const isPending = order.status === 'PENDING';
    const isCompleted = order.status === 'COMPLETED';
    const isCancelled = order.status === 'CANCELLED';

    // Calculate time elapsed for "Contact Support" button (e.g., > 30 mins)
    // We use useEffect to avoid hydration mismatch with Date.now()
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
                    {isCompleted ? "Trade Completed!" :
                        isCancelled ? "Trade Cancelled" :
                            "Trade Initiated!"}
                </h2>
                <p className="text-foreground/50 font-medium tracking-wide">
                    Order <span className="text-primary font-mono font-bold">#{order.order_number}</span>
                </p>
                {/* Status Badge */}
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
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">You Pay</p>
                        <p className="font-bold text-primary">
                            {order.type === 'BUY'
                                ? `${order.fiat_currency === 'GHS' ? 'GH₵' : '₦'}${order.amount_fiat} `
                                : `${order.amount_crypto} ${order.asset} `}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">You Get</p>
                        <p className="font-bold text-emerald-500">
                            {order.type === 'BUY'
                                ? `${order.amount_crypto} ${order.asset} `
                                : `${order.fiat_currency === 'GHS' ? 'GH₵' : '₦'}${order.amount_fiat} `}
                        </p>
                    </div>
                </div>

                {/* Payment Instructions (Only if Pending) */}
                {isPending && depositAddress ? (
                    <>
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Action Required</p>

                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                                <p className="text-xs text-amber-500 font-bold">1. Send EXACTLY <span className="text-foreground">
                                    {order.type === 'BUY'
                                        ? `${order.fiat_currency === 'GHS' ? 'GH₵' : '₦'}${order.amount_fiat} `
                                        : `${order.amount_crypto} ${order.asset} `}
                                </span></p>
                                <p className="text-[10px] text-amber-500/80 font-medium">Sending a different amount may delay your order.</p>
                            </div>

                            {order.type === 'BUY' && (
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 space-y-1">
                                    <p className="text-xs font-bold">2. Use Reference: <span className="text-white font-mono">{order.order_number}</span></p>
                                    <p className="text-[10px] text-blue-500/80 font-medium">Add this as the &quot;Note&quot; or &quot;Remarks&quot; in your bank app.</p>
                                </div>
                            )}

                            {order.type === 'SELL' && (
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 space-y-1">
                                    <p className="text-xs font-bold">2. Use High/Priority Gas Fee</p>
                                    <p className="text-[10px] text-blue-500/80 font-medium">Ensure transaction confirms quickly.</p>
                                </div>
                            )}

                            <p className="text-xs font-bold pt-2">{order.type === 'BUY' ? 'Payment Account Details:' : 'Send Wallet Address:'}</p>
                        </div>

                        <button
                            type="button"
                            className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5 group cursor-pointer w-full"
                            onClick={() => copyToClipboard(depositAddress)}
                            aria-label="Copy deposit address"
                        >
                            <p className="font-mono text-xs break-all text-foreground/80 flex-1 text-left">{depositAddress}</p>
                            <Copy className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
                        </button>
                    </>
                ) : isPending && !depositAddress ? (
                    <div className="space-y-2">
                        <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                            Payment Instructions Sent to <span className="text-primary">your email</span>
                        </p>
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 text-amber-500 text-xs font-bold leading-relaxed">
                            <Info className="h-4 w-4 shrink-0 mt-0.5" />
                            <p>Please wait up to 30 minutes for processing. If not received, contact support immediately.</p>
                        </div>
                    </div>
                ) : null}

                {/* Processing Info */}
                {isPending && (
                    <div className="pt-4 border-t border-white/5">
                        <div className="p-3 rounded-xl bg-white/5 flex items-center gap-3 text-xs font-medium text-foreground/60">
                            <Clock className="h-4 w-4 animate-spin-slow" />
                            <p>Processing Time: 5-30 Minutes</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/dashboard/orders" className="px-10 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all text-sm">
                    Back to Orders
                </Link>

                {showContactSupport && (
                    <Link href="/dashboard/support" className="px-10 py-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all text-sm flex items-center justify-center gap-2">
                        <Info className="h-4 w-4" /> Contact Support
                    </Link>
                )}
            </div>
        </motion.div>
    );
}

