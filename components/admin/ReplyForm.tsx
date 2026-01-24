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
        <div className="space-y-6 bg-card-bg/30 p-6 rounded-2xl border border-white/5">
            <AnimatePresence>
                {isSubmitting && (
                    <Loading message="Processing system request..." />
                )}
            </AnimatePresence>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground/40">Reply to Member</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">From</label>
                    <Select value={fromEmail} onValueChange={setFromEmail}>
                        <SelectTrigger className="w-full bg-card-bg border-white/10 font-mono text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {FROM_EMAILS.map((email) => (
                                <SelectItem key={email.value} value={email.value} className="font-mono text-xs">
                                    {email.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Update Status</label>
                    <Select value={status || "no_change"} onValueChange={(val) => setStatus(val === "no_change" ? undefined : val as TicketStatus)}>
                        <SelectTrigger className="w-full bg-card-bg border-white/10">
                            <SelectValue placeholder="Don't change status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="no_change">Don&apos;t change status</SelectItem>
                            <SelectItem value="OPEN" className="text-priority">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS" className="text-amber-500">In Progress</SelectItem>
                            <SelectItem value="CLOSED" className="text-foreground/40">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    placeholder="Type your response here..."
                    className="w-full rounded-xl border border-white/10 bg-card-bg px-4 py-3 text-sm focus:border-primary focus:outline-none transition-all resize-none font-medium"
                />
            </div>

            <div className="flex justify-end">
                <button
                    disabled={isSubmitting || !message}
                    onClick={handleSubmit}
                    className={cn(
                        "px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2",
                        (isSubmitting || !message) && "opacity-50 grayscale cursor-not-allowed"
                    )}
                >
                    <Send className="h-4 w-4" />
                    Send Reply
                </button>
            </div>
        </div>
    );
}
