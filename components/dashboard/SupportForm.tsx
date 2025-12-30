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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SupportFormProps {
    orders?: {
        id: string;
        order_number: string;
        asset: string;
        amount_crypto: number;
    }[];
    isWidgetOpen: boolean;
    onClose: () => void;
}

export function SupportForm({ orders = [], isWidgetOpen, onClose }: SupportFormProps) {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [orderId, setOrderId] = useState<string>("general");
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
                order_id: orderId === "general" ? undefined : orderId
            });

            if (result.success) {
                setSuccess(true);
                toast.success(result.success);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setSubject("");
                    setMessage("");
                    setOrderId("general");
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
        <AnimatePresence>
            {isWidgetOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isSubmitting && onClose()}
                        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-xl max-h-[90vh] rounded-[40px] border border-border bg-card-bg shadow-2xl overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decorative Pattern */}
                        <div className="absolute top-0 right-0 p-10 text-primary/5 -rotate-12 pointer-events-none">
                            <MessageSquare className="h-48 w-48" />
                        </div>

                        {/* Header - Fixed at top */}
                        <div className="relative z-10 p-8 md:p-10 pb-0 shrink-0">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <MessageSquare className="h-7 w-7 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight">Support Ticket</h3>
                                        <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em]">Typical response: 15 mins</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 rounded-2xl bg-card-bg/50 border border-border text-foreground/40 hover:text-foreground transition-all hover:scale-110 active:scale-95"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="relative z-10 p-8 md:p-10 pt-4 overflow-y-auto custom-scrollbar flex-1">

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-12"
                                >
                                    <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border-4 border-emerald-500/20">
                                        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                    </div>
                                    <h4 className="text-3xl font-black mb-3">Message Sent!</h4>
                                    <p className="text-foreground/50 font-medium leading-relaxed max-w-sm mx-auto">Your ticket has been logged. We&apos;ll notify you via email when an agent responds.</p>
                                </motion.div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">Subject</label>
                                        <input
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="e.g., Payment verification delay"
                                            className="w-full rounded-2xl border border-border bg-card-bg/20 px-6 py-5 font-bold placeholder:text-foreground/20 focus:border-primary focus:outline-none transition-all shadow-inner dark:shadow-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">Link to Order (Optional)</label>
                                        <div className="relative group">
                                            <ShoppingBag className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 z-10 pointer-events-none" />
                                            <Select value={orderId} onValueChange={setOrderId}>
                                                <SelectTrigger className="w-full rounded-2xl border-border bg-card-bg/20 pl-16 pr-6 py-5 h-auto font-bold focus:border-primary transition-all shadow-inner dark:shadow-none text-left">
                                                    <SelectValue placeholder="General Assistance" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-border bg-card-bg backdrop-blur-2xl">
                                                    <SelectItem
                                                        value="general"
                                                        className="rounded-xl py-3 px-4 font-bold cursor-pointer focus:bg-primary/10 focus:text-primary"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <MessageCircle className="h-4 w-4 text-primary shrink-0" />
                                                            <span>General Assistance</span>
                                                        </div>
                                                    </SelectItem>
                                                    {orders.map((order) => (
                                                        <SelectItem
                                                            key={order.id}
                                                            value={order.id}
                                                            className="rounded-xl py-3 px-4 font-bold cursor-pointer focus:bg-primary/10 focus:text-primary"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <ShoppingBag className="h-4 w-4 text-primary shrink-0" />
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="text-sm">{order.order_number}</span>
                                                                    <span className="text-[10px] text-foreground/40 uppercase tracking-wider">
                                                                        {order.amount_crypto} {order.asset}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-2">Your Message</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={5}
                                            placeholder="Describe your issue in detail..."
                                            className="w-full rounded-2xl border border-border bg-card-bg/20 px-6 py-5 font-bold placeholder:text-foreground/20 focus:border-primary focus:outline-none transition-all resize-none shadow-inner dark:shadow-none"
                                        />
                                    </div>

                                    <button
                                        disabled={isSubmitting || !subject || !message}
                                        onClick={handleSubmit}
                                        className="w-full py-6 rounded-2xl bg-primary text-white font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale"
                                    >
                                        {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                                            <>
                                                Open Support Ticket
                                                <Send className="h-5 w-5" />
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
    );
}


