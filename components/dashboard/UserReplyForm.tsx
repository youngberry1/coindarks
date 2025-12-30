"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { replyToTicketUser } from "@/actions/support";

interface UserReplyFormProps {
    ticketId: string; // This MUST be the UUID, not the public "CD-1234" ID
}

export function UserReplyForm({ ticketId }: UserReplyFormProps) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) return;

        setLoading(true);
        try {
            const result = await replyToTicketUser({
                ticketId,
                message,
            });

            if (result.success) {
                toast.success("Reply sent successfully");
                setMessage("");
                // Ideally refresh the parent page or use router.refresh()
                // But usually Server Actions with revalidatePath handle this if component is server rendered?
                // Wait, this is a client component inside a server page. We might need router.refresh()
                window.location.reload(); // Brute force refresh for now to see new message
            } else {
                toast.error(result.error || "Failed to send reply");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <Textarea
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                placeholder="Type your reply here..."
                className="min-h-[120px] bg-white/5 border-white/10 focus:border-primary/50 resize-y rounded-2xl p-4 pr-12"
            />
            <div className="mt-4 flex justify-end">
                <Button
                    onClick={handleSubmit}
                    disabled={loading || !message.trim()}
                    className="rounded-xl px-6"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Send Reply
                </Button>
            </div>
        </div>
    );
}
