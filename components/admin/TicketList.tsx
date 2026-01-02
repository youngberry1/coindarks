"use client";

import { useState } from "react";
import {
    MessageSquare,
    User,
    Mail,
    Clock,
    CheckCircle2,
    ShoppingBag
} from "lucide-react";
import { updateTicketStatus } from "@/actions/support";
import { toast } from "sonner";
import { Loading } from "@/components/ui/Loading";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Ticket {
    id: string;
    subject: string;
    message: string;
    status: 'OPEN' | 'CLOSED';
    created_at: string;
    order_id?: string | null;
    users: {
        first_name: string;
        last_name: string;
        email: string;
    };
    orders?: {
        order_number: string;
    } | null;
}

interface TicketListProps {
    initialTickets: Ticket[];
}

export function TicketList({ initialTickets }: TicketListProps) {
    const [tickets, setTickets] = useState(initialTickets);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleStatusUpdate = async (ticketId: string, newStatus: 'OPEN' | 'CLOSED') => {
        setUpdatingId(ticketId);
        try {
            const result = await updateTicketStatus(ticketId, newStatus);
            if (result.success) {
                toast.success(result.success);
                setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Failed to update ticket");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {updatingId && (
                    <Loading message="Synchronizing resolution status..." />
                )}
            </AnimatePresence>
            {tickets.map((ticket) => (
                <div key={ticket.id} className="p-8 rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md hover:border-white/10 transition-all group overflow-hidden relative">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                        <div className="flex items-start gap-6">
                            <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border",
                                ticket.status === 'OPEN' ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/5 text-foreground/20"
                            )}>
                                <MessageSquare className="h-6 w-6" />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold">{ticket.subject}</h3>
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                            ticket.status === 'OPEN' ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-foreground/40 bg-white/5 border-white/5"
                                        )}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-foreground/40 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <User className="h-3 w-3" />
                                            <span>{ticket.users.first_name} {ticket.users.last_name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="h-3 w-3" />
                                            <span>{ticket.users.email}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" />
                                            <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {ticket.order_id && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                                        <ShoppingBag className="h-3 w-3" />
                                        Related Order: {ticket.orders?.order_number || "Deleted"}
                                    </div>
                                )}

                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-sm leading-relaxed text-foreground/70 font-medium italic">
                                    &quot;{ticket.message}&quot;
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 md:self-center">
                            {ticket.status === 'OPEN' ? (
                                <button
                                    onClick={() => handleStatusUpdate(ticket.id, 'CLOSED')}
                                    disabled={updatingId === ticket.id}
                                    className="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-[0.98] transition-all flex items-center gap-2"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Resolve Ticket
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleStatusUpdate(ticket.id, 'OPEN')}
                                    disabled={updatingId === ticket.id}
                                    className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-foreground/40 hover:text-foreground hover:bg-white/10 font-bold text-sm transition-all flex items-center gap-2"
                                >
                                    <Clock className="h-4 w-4" />
                                    Reopen Ticket
                                </button>
                            )}
                            <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-foreground/40 hover:text-primary transition-all">
                                <Mail className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {tickets.length === 0 && (
                <div className="text-center py-20 rounded-[40px] border border-white/5 bg-card-bg/30">
                    <MessageSquare className="h-12 w-12 text-foreground/10 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No tickets found</h3>
                    <p className="text-foreground/40">Everything is running smoothly.</p>
                </div>
            )}
        </div>
    );
}
