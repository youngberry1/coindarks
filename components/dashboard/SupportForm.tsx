"use client";

import { useState } from "react";
import {
    MessageSquare,
    Send,
    Loader2,
    CheckCircle2,
    X,
    MessageCircle,
    ShoppingBag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createTicket } from "@/actions/support";
import { toast } from "sonner";

interface SupportFormProps {
    orders?: {
        id: string;
        order_number: string;
        asset: string;
        amount_crypto: number;
    }[];
}

export function SupportForm({ orders = [] }: SupportFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [orderId, setOrderId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!subject || !message) {
            toast.error("Please fill in basic details");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createTicket({
                subject,
                message,
                order_id: orderId || undefined
            });

            if (result.success) {
                setSuccess(true);
                toast.success(result.success);
                // Reset form after 2s
                setTimeout(() => {
                    setIsOpen(false);
                    setSuccess(false);
                    setSubject("");
                    setMessage("");
                    setOrderId("");
                }, 3000);
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Failed to send message");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-between p-6 rounded-[32px] bg-linear-to-br from-primary/20 to-transparent border border-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                        <MessageCircle className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-sm">Need Assistance?</p>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Connect with Support</p>
                    </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-foreground/20 group-hover:text-primary transition-colors">
                    <Send className="h-4 w-4" />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSubmitting && setIsOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg p-8 rounded-[40px] border border-white/10 bg-card-bg shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative background pattern */}
                            <div className="absolute top-0 right-0 p-8 text-primary/5 -rotate-12">
                                <MessageSquare className="h-40 w-40" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <MessageSquare className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">Support Ticket</h3>
                                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Typical response: 15 mins</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 rounded-xl bg-white/5 text-foreground/40 hover:text-foreground transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {success ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-12"
                                    >
                                        <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                        </div>
                                        <h4 className="text-2xl font-black mb-2">Message Sent!</h4>
                                        <p className="text-foreground/50 font-medium">Your ticket has been logged. We&apos;ll notify you via email when an agent responds.</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Subject</label>
                                            <input
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="e.g., Payment verification delay"
                                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold placeholder:text-foreground/10 focus:border-primary focus:outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Link to Order (Optional)</label>
                                            <div className="relative">
                                                <ShoppingBag className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                                                <select
                                                    value={orderId}
                                                    onChange={(e) => setOrderId(e.target.value)}
                                                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-6 py-4 font-bold outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="" className="bg-background">General Assistance</option>
                                                    {orders.map((order) => (
                                                        <option key={order.id} value={order.id} className="bg-background">
                                                            {order.order_number} - {order.amount_crypto} {order.asset}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Your Message</label>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                rows={4}
                                                placeholder="Describe your issue in detail..."
                                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold placeholder:text-foreground/10 focus:border-primary focus:outline-none transition-all resize-none"
                                            />
                                        </div>

                                        <button
                                            disabled={isSubmitting || !subject || !message}
                                            onClick={handleSubmit}
                                            className="w-full py-5 rounded-[20px] bg-primary text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                                <>
                                                    Open Support Ticket
                                                    <Send className="h-4 w-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

function ChevronDown({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m6 9 6 6 6-6" />
        </svg>
    )
}
