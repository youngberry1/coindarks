"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { SupportModal } from "./SupportModal";

interface DashboardSupportProps {
    orders: {
        id: string;
        order_number: string;
        asset: string;
        amount_crypto: number;
    }[];
}

export function DashboardSupport({ orders }: DashboardSupportProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-between p-6 rounded-[32px] bg-linear-to-br from-primary/10 to-transparent border border-border hover:border-primary/30 active:scale-[0.98] transition-all group"
            >
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform shrink-0">
                        <MessageCircle className="h-6 w-6" />
                    </div>
                    <div className="text-left overflow-hidden">
                        <p className="font-black text-sm">Need Assistance?</p>
                        <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-widest truncate">Connect with Support</p>
                    </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-card-bg/50 border border-border flex items-center justify-center text-foreground/50 group-hover:text-primary transition-colors shrink-0">
                    <Send className="h-4 w-4" />
                </div>
            </button>

            <SupportModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                orders={orders}
            />
        </>
    );
}
