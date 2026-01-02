"use client";

import { MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SupportForm } from "./SupportForm";

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders?: {
        id: string;
        order_number: string;
        asset: string;
        amount_crypto: number;
    }[];
}

export function SupportModal({ isOpen, onClose, orders = [] }: SupportModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
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
                            <SupportForm
                                orders={orders}
                                onClose={onClose}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
