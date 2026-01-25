"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { sendDirectUserEmail } from "@/actions/admin";
import { toast } from "sonner";
import { Send, AlertCircle } from "lucide-react";
import { Loading } from "@/components/ui/LoadingSpinner";
import { AnimatePresence, motion } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DirectEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        email: string;
        name: string;
    } | null;
}

export function DirectEmailModal({ isOpen, onClose, user }: DirectEmailModalProps) {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [fromType, setFromType] = useState<"admin" | "support" | "ghana" | "finance" | "noreply">("admin");
    const [isLoading, setIsLoading] = useState(false);

    const fromEmails = {
        admin: "admin@coindarks.com",
        support: "support@coindarks.com",
        ghana: "ghana@coindarks.com",
        finance: "finance@coindarks.com",
        noreply: "noreply@coindarks.com", // This will fallback to env if not matched, but we use these specific ones
    };

    const handleSend = async () => {
        if (!user || !subject || !message) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const result = await sendDirectUserEmail(user.id, subject, message, fromEmails[fromType]);
            if (result.success) {
                toast.success(result.success);
                setSubject("");
                setMessage("");
                onClose();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Send Email"
            description={`Send a direct email to ${user?.name}.`}
        >
            <div className="space-y-6">
                <AnimatePresence>
                    {isLoading && (
                        <Loading message="Processing system request..." />
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 transition-all hover:bg-white/10 dark:hover:bg-white/10 overflow-hidden"
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 ml-1">Recipient</p>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 text-xs font-bold uppercase">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <p className="font-bold text-sm truncate">{user?.email}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 rounded-2xl bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 transition-all hover:bg-white/10 dark:hover:bg-white/10"
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 ml-1">From</p>
                        <Select value={fromType} onValueChange={(value: "admin" | "support" | "finance" | "noreply") => setFromType(value)}>
                            <SelectTrigger className="w-full bg-transparent border-none p-0 h-auto font-bold text-sm text-primary hover:text-primary/80 transition-colors focus:ring-0 shadow-none">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-white/10">
                                <SelectItem value="admin" className="focus:bg-primary/20 focus:text-primary cursor-pointer">Admin (admin@)</SelectItem>
                                <SelectItem value="support" className="focus:bg-primary/20 focus:text-primary cursor-pointer">Support (support@)</SelectItem>
                                <SelectItem value="ghana" className="focus:bg-primary/20 focus:text-primary cursor-pointer">Ghana (ghana@)</SelectItem>
                                <SelectItem value="finance" className="focus:bg-primary/20 focus:text-primary cursor-pointer">Finance (finance@)</SelectItem>
                                <SelectItem value="noreply" className="focus:bg-primary/20 focus:text-primary cursor-pointer">Default (noreply@)</SelectItem>
                            </SelectContent>
                        </Select>
                    </motion.div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <AlertCircle className="h-3 w-3" /> Subject
                        </label>
                        <input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Identity Verification Update"
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Message Content</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your message here..."
                            className="w-full h-48 rounded-2xl border border-white/10 bg-white/5 px-5 py-5 font-medium text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none custom-scrollbar"
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isLoading || !subject || !message}
                        onClick={handleSend}
                        className="flex-2 py-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                    >
                        <Send className="h-4 w-4" />
                        <span>Send Email</span>
                    </button>
                </div>

                <p className="text-[10px] text-center text-foreground/20 font-medium">
                    This email will be sent from the selected address.
                </p>
            </div>
        </Modal>
    );
}
