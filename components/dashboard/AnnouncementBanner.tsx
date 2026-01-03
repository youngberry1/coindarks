"use client";

import { useState, useEffect } from "react";
import { X, Megaphone, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Announcement } from "@/types/db";

interface AnnouncementBannerProps {
    announcements: Announcement[];
}

export function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);

    useEffect(() => {
        // Initialize dismissed IDs from localStorage on mount
        const stored = JSON.parse(localStorage.getItem("dismissed_announcements") || "[]");
        setDismissedIds(stored);
    }, []);

    const visibleAnnouncements = announcements.filter(a => !dismissedIds.includes(a.id));

    const handleDismiss = (id: string) => {
        const nextDismissed = [...dismissedIds, id];
        setDismissedIds(nextDismissed);
        localStorage.setItem("dismissed_announcements", JSON.stringify(nextDismissed));
    };

    if (visibleAnnouncements.length === 0) return null;

    return (
        <div className="space-y-4 mb-10 md:mb-14">
            <AnimatePresence>
                {visibleAnnouncements.map((announcement) => {
                    const severityConfig = {
                        URGENT: {
                            bg: "bg-red-500/10 border-red-500/20",
                            icon: AlertCircle,
                            iconColor: "text-red-500",
                            textColor: "text-red-500",
                            accentBg: "bg-red-500/20"
                        },
                        WARNING: {
                            bg: "bg-amber-500/10 border-amber-500/20",
                            icon: AlertTriangle,
                            iconColor: "text-amber-500",
                            textColor: "text-amber-500",
                            accentBg: "bg-amber-500/20"
                        },
                        INFO: {
                            bg: "bg-primary/10 border-primary/20",
                            icon: Info,
                            iconColor: "text-primary",
                            textColor: "text-primary",
                            accentBg: "bg-primary/20"
                        }
                    }[announcement.severity] || {
                        bg: "bg-white/5 border-white/10",
                        icon: Megaphone,
                        iconColor: "text-foreground/40",
                        textColor: "text-foreground",
                        accentBg: "bg-white/10"
                    };

                    const Icon = severityConfig.icon;

                    return (
                        <motion.div
                            key={announcement.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`relative overflow-hidden p-6 rounded-[32px] border ${severityConfig.bg} group`}
                        >
                            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity ${severityConfig.iconColor}`}>
                                <Icon className="h-24 w-24 rotate-12" />
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${severityConfig.accentBg}`}>
                                    <Icon className={`h-6 w-6 ${severityConfig.iconColor}`} />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className={`text-lg font-bold ${severityConfig.textColor}`}>
                                            {announcement.severity === 'URGENT' ? 'Urgent Update' :
                                                announcement.severity === 'WARNING' ? 'Important Notice' :
                                                    'Announcement'}
                                        </h3>
                                        <span className="h-1 w-1 rounded-full bg-foreground/20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                            {new Date(announcement.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/80 font-medium leading-relaxed max-w-4xl">
                                        {announcement.content}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleDismiss(announcement.id)}
                                    className="p-3 rounded-2xl bg-white/5 border border-white/10 text-foreground/40 hover:text-foreground hover:bg-white/10 transition-all shrink-0"
                                    aria-label="Dismiss announcement"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
