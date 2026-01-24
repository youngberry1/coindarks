"use client";

import { useState, useEffect } from "react";
import { X, Megaphone, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Announcement } from "@/types/db";
import { cn } from "@/lib/utils";

interface AnnouncementBannerProps {
    announcements: Announcement[];
}

export function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
    const [dismissedIds, setDismissedIds] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("dismissed_announcements") || "[]");
        // Defer state update to avoid synchronous setState in effect
        Promise.resolve().then(() => {
            setDismissedIds(stored);
            setMounted(true);
        });
    }, []);

    const visibleAnnouncements = announcements.filter(a => !dismissedIds.includes(a.id));

    const handleDismiss = (id: string) => {
        const nextDismissed = [...dismissedIds, id];
        setDismissedIds(nextDismissed);
        localStorage.setItem("dismissed_announcements", JSON.stringify(nextDismissed));
    };

    // We don't return null here anymore, we render the AnimatePresence
    // which handles the "empty" state with exit animations if needed,
    // or simply renders nothing if criteria aren't met.
    // However, to prevent a static "pop" we rely on the mounted check inside the JSX.

    return (
        <div className="space-y-6 mb-12">
            <AnimatePresence mode="wait" initial={false}>
                {visibleAnnouncements.length > 0 && mounted && visibleAnnouncements.map((announcement) => {
                    const severityConfig = {
                        URGENT: {
                            bg: "bg-red-500/10 border-red-500/20",
                            icon: AlertCircle,
                            iconColor: "text-red-500",
                            textColor: "text-red-500",
                            accentBg: "bg-red-500/20",
                            glow: "shadow-red-500/10"
                        },
                        WARNING: {
                            bg: "bg-amber-500/10 border-amber-500/20",
                            icon: AlertTriangle,
                            iconColor: "text-amber-500",
                            textColor: "text-amber-500",
                            accentBg: "bg-amber-500/20",
                            glow: "shadow-amber-500/10"
                        },
                        INFO: {
                            bg: "glass-card border-white/5",
                            icon: Info,
                            iconColor: "text-primary",
                            textColor: "text-primary",
                            accentBg: "bg-primary/20",
                            glow: "shadow-primary/10"
                        }
                    }[announcement.severity] || {
                        bg: "glass-card border-white/5",
                        icon: Megaphone,
                        iconColor: "text-foreground/40",
                        textColor: "text-foreground",
                        accentBg: "bg-white/10",
                        glow: "shadow-white/5"
                    };

                    const Icon = severityConfig.icon;

                    return (
                        <motion.div
                            key={announcement.id}
                            initial={{ opacity: 0, scale: 0.98, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} // Quicker, smoother entrance
                        >
                            <div
                                className={cn(
                                    "relative overflow-hidden p-5 md:p-8 rounded-[32px] md:rounded-[40px] border shadow-2xl group transition-all duration-500 mb-6", // moved mb-6 here to animate with height
                                    severityConfig.bg,
                                    severityConfig.glow
                                )}
                            >
                                {/* Decorative background element */}
                                <div className={cn(
                                    "absolute -top-12 -right-12 h-48 w-48 blur-[80px] opacity-20 transition-all duration-1000 group-hover:scale-110",
                                    severityConfig.iconColor.replace("text-", "bg-")
                                )} />

                                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 sm:gap-8">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:rotate-6",
                                        severityConfig.accentBg,
                                        announcement.severity === 'URGENT' ? 'border-red-500/20' :
                                            announcement.severity === 'WARNING' ? 'border-amber-500/20' :
                                                'border-white/5'
                                    )}>
                                        <Icon className={cn("h-7 w-7", severityConfig.iconColor)} />
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                                                severityConfig.accentBg,
                                                announcement.severity === 'URGENT' ? 'border-red-500/20' :
                                                    announcement.severity === 'WARNING' ? 'border-amber-500/20' :
                                                        'border-white/5'
                                            )}>
                                                {announcement.severity === 'URGENT' ? 'Critical Link' :
                                                    announcement.severity === 'WARNING' ? 'Protocol Notice' :
                                                        'Master Relay'}
                                            </div>
                                            <div className="h-1 w-1 rounded-full bg-white/10" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                                                {new Date(announcement.created_at).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm md:text-base text-foreground/60 font-medium leading-relaxed max-w-5xl">
                                            {announcement.content}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <button
                                            onClick={() => handleDismiss(announcement.id)}
                                            className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 text-foreground/20 hover:text-foreground hover:bg-white/10 hover:border-white/10 transition-all active:scale-90 flex items-center justify-center group/btn"
                                            aria-label="Acknowledge and dismiss"
                                        >
                                            <X className="h-5 w-5 group-hover/btn:rotate-90 transition-transform duration-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
