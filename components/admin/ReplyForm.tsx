"use client";

import { useState } from "react";
import { replyToTicket, TicketStatus } from "@/actions/support";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Loading } from "@/components/ui/LoadingSpinner";
import { AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ReplyFormProps {
    ticketId: string;
}

const FROM_EMAILS = [
    { value: 'support@coindarks.com', label: 'Support Desk (support@coindarks.com)' },
    { value: 'admin@coindarks.com', label: 'Administrator (admin@coindarks.com)' },
    { value: 'finance@coindarks.com', label: 'Finance Dept (finance@coindarks.com)' },
    { value: 'noreply@coindarks.com', label: 'System (noreply@coindarks.com)' },
];

export function ReplyForm({ ticketId }: ReplyFormProps) {
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<TicketStatus | undefined>(undefined);
    const [fromEmail, setFromEmail] = useState<string>("support@coindarks.com");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!message) {
            toast.error("Please enter a message");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await replyToTicket({
                ticketId,
                message,
                status,
                fromEmail: fromEmail as 'admin@coindarks.com' | 'support@coindarks.com' | 'finance@coindarks.com' | 'noreply@coindarks.com',
            });

            if (result && result.success) {
                toast.success("Reply sent successfully");
                setMessage("");
                setStatus(undefined);
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Failed to send reply");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 bg-card-bg/30 p-8 md:p-10 rounded-[40px] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <AnimatePresence>
                {isSubmitting && (
                    <Loading message="Processing system request..." />
                )}
            </AnimatePresence>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-2 w-8 bg-primary rounded-full" />
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground/60">Reply Protocols</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-3 font-sans">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[.2em] ml-1">Relay Source</label>
                        <Select value={fromEmail} onValueChange={setFromEmail}>
                            <SelectTrigger className="h-auto min-h-[52px] w-full bg-white/5 border-white/10 hover:border-primary/50 transition-all rounded-2xl font-display text-[11px] md:text-sm px-4 md:px-6 py-3 font-medium">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card-bg/95 backdrop-blur-3xl border-white/10 rounded-2xl p-2 w-(--radix-select-trigger-width) min-w-[200px] font-sans">
                                {FROM_EMAILS.map((email) => (
                                    <SelectItem key={email.value} value={email.value} className="text-[11px] md:text-sm rounded-xl focus:bg-primary py-3 transition-colors font-medium truncate">
                                        {email.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3 font-sans">
                        <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[.2em] ml-1">Node Status</label>
                        <Select value={status || "no_change"} onValueChange={(val) => setStatus(val === "no_change" ? undefined : val as TicketStatus)}>
                            <SelectTrigger className="h-auto min-h-[52px] w-full bg-white/5 border-white/10 hover:border-primary/50 transition-all rounded-2xl px-4 md:px-6 py-3 font-display text-[11px] md:text-sm font-medium">
                                <SelectValue placeholder="No change required" />
                            </SelectTrigger>
                            <SelectContent className="bg-card-bg/95 backdrop-blur-3xl border-white/10 rounded-2xl p-2 w-(--radix-select-trigger-width) min-w-[200px] font-sans">
                                <SelectItem value="no_change" className="rounded-xl py-3 focus:bg-white/10 text-xs md:text-sm font-medium">No change required</SelectItem>
                                <SelectItem value="OPEN" className="rounded-xl py-3 focus:bg-primary/20 text-primary font-bold text-xs md:text-sm">Mark as Open</SelectItem>
                                <SelectItem value="IN_PROGRESS" className="rounded-xl py-3 focus:bg-amber-500/20 text-amber-500 font-bold text-xs md:text-sm">In Progress</SelectItem>
                                <SelectItem value="CLOSED" className="rounded-xl py-3 focus:bg-emerald-500/20 text-emerald-500 font-bold text-xs md:text-sm">Close Ticket</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3 mb-8">
                    <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[.2em] ml-1">Response Content</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        placeholder="Type your secure response here..."
                        className="w-full rounded-[28px] border border-white/10 bg-white/5 px-6 py-5 text-[15px] focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none font-medium placeholder:text-foreground/20 leading-relaxed"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        disabled={isSubmitting || !message}
                        onClick={handleSubmit}
                        className={cn(
                            "group px-10 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3",
                            (isSubmitting || !message) && "opacity-40 grayscale cursor-not-allowed translate-y-0"
                        )}
                    >
                        <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        Execute Reply
                    </button>
                </div>
            </div>
        </div>
    );
}
