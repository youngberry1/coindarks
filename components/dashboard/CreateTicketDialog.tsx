"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SupportModal } from "./SupportModal";

interface CreateTicketDialogProps {
    orders?: {
        id: string;
        order_number: string;
        asset: string;
        amount_crypto: number;
    }[];
}

export function CreateTicketDialog({ orders = [] }: CreateTicketDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="h-14 rounded-2xl bg-primary text-white gap-2 font-bold px-8 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
            >
                <Plus className="h-5 w-5" />
                New Help Request
            </button>

            <SupportModal
                isOpen={open}
                onClose={() => setOpen(false)}
                orders={orders}
            />
        </>
    );
}
