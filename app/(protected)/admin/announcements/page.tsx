"use client";

import { useState, useEffect } from "react";
import {
    Megaphone,
    Plus,
    Trash2,
    Power,
    PowerOff,
    AlertCircle,
    AlertTriangle,
    Info,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getAnnouncements,
    createAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement
} from "@/actions/announcements";
import { Announcement, AnnouncementSeverity } from "@/types/db";
import { toast } from "sonner";

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [content, setContent] = useState("");
    const [severity, setSeverity] = useState<AnnouncementSeverity>("INFO");

    const fetchAnnouncements = async () => {
        setIsLoading(true);
        const result = await getAnnouncements();
        if (result.data) {
            setAnnouncements(result.data);
        } else {
            toast.error(result.error || "Failed to load announcements");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchAnnouncements(), 0);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        const result = await createAnnouncement(content, severity);
        if (result.success) {
            toast.success("Announcement created successfully");
            setContent("");
            setSeverity("INFO");
            fetchAnnouncements();
        } else {
            toast.error(result.error || "Failed to create announcement");
        }
        setIsSubmitting(false);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const result = await toggleAnnouncement(id, !currentStatus);
        if (result.success) {
            toast.success(`Announcement ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchAnnouncements();
        } else {
            toast.error(result.error || "Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;

        const result = await deleteAnnouncement(id);
        if (result.success) {
            toast.success("Announcement deleted");
            fetchAnnouncements();
        } else {
            toast.error(result.error || "Failed to delete announcement");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-[24px] bg-primary/10 flex items-center justify-center">
                    <Megaphone className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Announcements</h1>
                    <p className="text-foreground/60 font-medium">Broadcast important news to all platform users.</p>
                </div>
            </div>

            {/* Creation Form */}
            <div className="p-8 rounded-[40px] border border-border bg-card-bg/50 backdrop-blur-md shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    New Announcement
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Message Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter the announcement details here..."
                            className="w-full min-h-[120px] p-6 rounded-3xl bg-background border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-medium resize-none"
                            required
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">Severity Level</label>
                            <div className="grid grid-cols-3 gap-3">
                                {(["INFO", "WARNING", "URGENT"] as const).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setSeverity(s)}
                                        className={`py-3 rounded-2xl border transition-all text-[11px] font-black tracking-widest uppercase ${severity === s
                                            ? s === 'URGENT' ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' :
                                                s === 'WARNING' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' :
                                                    'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                            : 'bg-background border-border hover:border-primary/30 text-foreground/60'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full md:w-auto px-10 py-4 rounded-2xl bg-foreground text-background font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
                                Publish
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Active & Past Announcements</h3>
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            // Skeleton Loading State - Matches exact card structure
                            Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={`skeleton-${i}`}
                                    className="p-6 rounded-[32px] border border-border bg-card-bg/30 backdrop-blur-sm shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center"
                                >
                                    {/* Icon skeleton */}
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 shrink-0 animate-pulse" />

                                    {/* Content skeleton */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                                            <div className="h-3 w-40 bg-white/5 rounded animate-pulse" />
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed space-y-2">
                                            <span className="block h-4 w-full bg-white/5 rounded animate-pulse"></span>
                                            <span className="block h-4 w-[98%] bg-white/5 rounded animate-pulse"></span>
                                            <span className="block h-4 w-[95%] bg-white/5 rounded animate-pulse"></span>
                                            <span className="block h-4 w-[85%] bg-white/5 rounded animate-pulse"></span>
                                        </p>
                                    </div>

                                    {/* Action buttons skeleton */}
                                    <div className="flex items-center gap-2 self-end md:self-auto">
                                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-border animate-pulse" />
                                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-border animate-pulse" />
                                    </div>
                                </div>
                            ))
                        ) : announcements.length > 0 ? (
                            announcements.map((a) => (
                                <motion.div
                                    key={a.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-6 rounded-[32px] border bg-card-bg/30 backdrop-blur-sm shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center relative group ${!a.is_active ? "opacity-60 grayscale-[0.5]" : ""
                                        }`}
                                >
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${a.severity === 'URGENT' ? 'bg-red-500/10 text-red-500' :
                                        a.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-primary/10 text-primary'
                                        }`}>
                                        {a.severity === 'URGENT' ? <AlertCircle className="h-6 w-6" /> :
                                            a.severity === 'WARNING' ? <AlertTriangle className="h-6 w-6" /> :
                                                <Info className="h-6 w-6" />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${a.severity === 'URGENT' ? 'text-red-500' :
                                                a.severity === 'WARNING' ? 'text-amber-500' :
                                                    'text-primary'
                                                }`}>
                                                {a.severity}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
                                                {new Date(a.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed">{a.content}</p>
                                    </div>

                                    <div className="flex items-center gap-2 self-end md:self-auto">
                                        <button
                                            onClick={() => handleToggle(a.id, a.is_active)}
                                            className={`p-3 rounded-2xl border transition-all ${a.is_active
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
                                                : "bg-foreground/5 border-border text-foreground/40 hover:bg-foreground/10"
                                                }`}
                                            title={a.is_active ? "Deactivate" : "Activate"}
                                        >
                                            {a.is_active ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(a.id)}
                                            className="p-3 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-card-bg/20 rounded-[40px] border border-dashed border-border">
                                <Megaphone className="h-12 w-12 text-foreground/10 mx-auto mb-4" />
                                <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">No announcements yet</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
