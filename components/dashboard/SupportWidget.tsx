"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SupportModal } from "./SupportModal";

interface SupportWidgetProps {
    orders?: {
        id: string;
        order_number: string;
        asset: string;
        amount_crypto: number;
    }[];
}

export function SupportWidget({ orders = [] }: SupportWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-6 right-6 z-100 flex flex-col items-end gap-4 pointer-events-none">
                {/* The Floating Button */}
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="pointer-events-auto h-14 w-14 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center transition-transform group"
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                            >
                                <X className="h-6 w-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                className="relative"
                            >
                                <MessageCircle className="h-6 w-6" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 border-2 border-primary rounded-full animate-pulse" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            {/* The Unified Modal - Outside the pointer-events-none div */}
            <SupportModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                orders={orders}
            />
        </>
    );
}
