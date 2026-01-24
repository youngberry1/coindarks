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
    Loader2,
    Send
} from "lucide-react";
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
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [content, setContent] = useState("");
    const [severity, setSeverity] = useState<AnnouncementSeverity>("INFO");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchAnnouncements = async (showLoading = false) => {
        if (showLoading) setIsInitialLoading(true);
        const result = await getAnnouncements();
        if (result.data) {
            setAnnouncements(result.data);
        } else {
            toast.error(result.error || "Failed to load announcements");
        }
        if (showLoading) setIsInitialLoading(false);
    };

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (isMounted) {
                await fetchAnnouncements(true);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
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
            fetchAnnouncements(false);
        } else {
            toast.error(result.error || "Failed to create announcement");
        }
        setIsSubmitting(false);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const result = await toggleAnnouncement(id, !currentStatus);
        if (result.success) {
            toast.success(`Announcement ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchAnnouncements(false);
        } else {
            toast.error(result.error || "Failed to update status");
        }
    };

    const handleDelete = (id: string) => {
        setDeletingId(id);
    };

    const confirmDelete = async (id: string) => {
        const result = await deleteAnnouncement(id);
        if (result.success) {
            toast.success("Announcement deleted");
            fetchAnnouncements(false);
        } else {
            toast.error(result.error || "Failed to delete announcement");
        }
        setDeletingId(null);
    };

    const cancelDelete = () => {
        setDeletingId(null);
    };

    return (
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto space-y-6 md:space-y-8 lg:space-y-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 md:gap-5 lg:gap-6">
                <div className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 rounded-2xl md:rounded-[24px] lg:rounded-[28px] bg-primary/10 flex items-center justify-center shrink-0">
                    <Megaphone className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight">Announcements</h1>
                    <p className="text-sm md:text-base lg:text-lg text-foreground/60 font-medium mt-1">Broadcast important news to all platform users.</p>
                </div>
            </div>

            {/* Creation Form */}
            <div className="p-6 md:p-8 lg:p-10 rounded-3xl md:rounded-[40px] lg:rounded-[48px] border border-border bg-card-bg/50 backdrop-blur-md shadow-sm">
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 md:mb-6 lg:mb-8 flex items-center gap-2 md:gap-3">
                    <Plus className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-primary" />
                    New Announcement
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 lg:space-y-8">
                    <div className="space-y-2 md:space-y-3">
                        <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground/40 px-2">Message Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter the announcement details here..."
                            className="w-full min-h-[100px] md:min-h-[120px] lg:min-h-[140px] p-4 md:p-6 lg:p-7 rounded-2xl md:rounded-3xl lg:rounded-[32px] bg-background border border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm md:text-base lg:text-lg font-medium resize-none"
                            required
                        />
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
                        <div className="flex-1 space-y-2 md:space-y-3">
                            <label className="text-[10px] md:text-xs font-black uppercase tracking-widest text-foreground/40 px-2">Severity Level</label>
                            <div className="grid grid-cols-3 gap-2 md:gap-3 lg:gap-4">
                                {(["INFO", "WARNING", "URGENT"] as const).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setSeverity(s)}
                                        className={`py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl lg:rounded-[20px] border transition-all text-[10px] md:text-xs lg:text-sm font-black tracking-widest uppercase ${severity === s
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
                                className="w-full lg:w-auto px-6 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-[20px] bg-foreground text-background font-black text-xs md:text-sm lg:text-base uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 md:gap-3 shadow-xl"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" /> : <Send className="h-4 w-4 md:h-5 md:w-5" />}
                                Publish
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="space-y-4 md:space-y-5 lg:space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-widest text-foreground/40">Active & Past Announcements</h3>
                    {isInitialLoading && <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-primary" />}
                </div>

                <div className="space-y-3 md:space-y-4 lg:space-y-5">
                    {isInitialLoading ? (
                        // Fixed-height skeleton cards - exact dimensions to prevent layout shift
                        Array.from({ length: 2 }).map((_, i) => (
                            <div
                                key={`skeleton-${i}`}
                                className="h-[180px] md:h-[200px] lg:h-[220px] p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-[32px] lg:rounded-[40px] border border-border bg-card-bg/30 backdrop-blur-sm shadow-sm flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 items-start md:items-center overflow-hidden"
                            >
                                {/* Icon skeleton */}
                                <div className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-xl md:rounded-2xl lg:rounded-[20px] bg-white/5 shrink-0 animate-pulse" />

                                {/* Content skeleton */}
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-3 mb-3 md:mb-4">
                                        <div className="h-3 md:h-4 w-16 md:w-20 bg-white/5 rounded animate-pulse" />
                                        <div className="h-3 md:h-4 w-32 md:w-40 lg:w-48 bg-white/5 rounded animate-pulse" />
                                    </div>
                                    <div className="space-y-3 md:space-y-3.5 lg:space-y-4">
                                        <div className="h-5 md:h-6 lg:h-7 w-full bg-white/5 rounded animate-pulse"></div>
                                        <div className="h-5 md:h-6 lg:h-7 w-[95%] bg-white/5 rounded animate-pulse"></div>
                                        <div className="h-5 md:h-6 lg:h-7 w-[90%] bg-white/5 rounded animate-pulse"></div>
                                    </div>
                                </div>

                                {/* Action buttons skeleton */}
                                <div className="flex items-center gap-2 md:gap-3 self-end md:self-auto shrink-0">
                                    <div className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-xl md:rounded-2xl lg:rounded-[20px] bg-white/5 border border-border animate-pulse" />
                                    <div className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-xl md:rounded-2xl lg:rounded-[20px] bg-white/5 border border-border animate-pulse" />
                                </div>
                            </div>
                        ))
                    ) : announcements.length > 0 ? (
                        announcements.map((a) => (
                            <div
                                key={a.id}
                                className={`min-h-[120px] md:min-h-[140px] lg:min-h-[160px] p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-[32px] lg:rounded-[40px] border bg-card-bg/30 backdrop-blur-sm shadow-sm flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8 items-start md:items-center relative group transition-opacity duration-200 ${!a.is_active ? "opacity-60 grayscale-[0.5]" : ""
                                    }`}
                            >
                                <div className={`h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-xl md:rounded-2xl lg:rounded-[20px] flex items-center justify-center shrink-0 ${a.severity === 'URGENT' ? 'bg-red-500/10 text-red-500' :
                                    a.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-primary/10 text-primary'
                                    }`}>
                                    {a.severity === 'URGENT' ? <AlertCircle className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" /> :
                                        a.severity === 'WARNING' ? <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" /> :
                                            <Info className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />}
                                </div>

                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-3 mb-1 md:mb-2">
                                        <span className={`text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-widest ${a.severity === 'URGENT' ? 'text-red-500' :
                                            a.severity === 'WARNING' ? 'text-amber-500' :
                                                'text-primary'
                                            }`}>
                                            {a.severity}
                                        </span>
                                        <span className="text-[10px] md:text-xs text-foreground/20 font-black uppercase tracking-widest">
                                            {new Date(a.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm md:text-base lg:text-lg font-medium leading-relaxed">{a.content}</p>
                                </div>

                                <div className="flex items-center gap-2 md:gap-3 self-end md:self-auto shrink-0">
                                    <button
                                        onClick={() => handleToggle(a.id, a.is_active)}
                                        className={`p-2.5 md:p-3 lg:p-4 rounded-xl md:rounded-2xl lg:rounded-[20px] border transition-all ${a.is_active
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
                                            : "bg-foreground/5 border-border text-foreground/40 hover:bg-foreground/10"
                                            }`}
                                        title={a.is_active ? "Deactivate" : "Activate"}
                                    >
                                        {a.is_active ? <Power className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" /> : <PowerOff className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />}
                                    </button>
                                    {deletingId === a.id ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => confirmDelete(a.id)}
                                                className="px-3 md:px-4 lg:px-5 py-2 md:py-2.5 lg:py-3 rounded-xl md:rounded-2xl bg-red-500 border border-red-500 text-white text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition-all"
                                                title="Confirm Delete"
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={cancelDelete}
                                                className="px-3 md:px-4 lg:px-5 py-2 md:py-2.5 lg:py-3 rounded-xl md:rounded-2xl bg-foreground/10 border border-border text-foreground text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-wider hover:bg-foreground/20 transition-all"
                                                title="Cancel"
                                            >
                                                No
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleDelete(a.id)}
                                            className="p-2.5 md:p-3 lg:p-4 rounded-xl md:rounded-2xl lg:rounded-[20px] bg-red-500/5 border border-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16 md:py-20 lg:py-24 bg-card-bg/20 rounded-3xl md:rounded-[40px] lg:rounded-[48px] border border-dashed border-border">
                            <Megaphone className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 text-foreground/10 mx-auto mb-4" />
                            <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs md:text-sm">No announcements yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
