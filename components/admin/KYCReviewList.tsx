"use client";

import { useState } from "react";
import {
    XCircle,
    Mail,
    FileText,
    Calendar,
    X,
    Maximize2,
    ShieldCheck,
    Fingerprint,
    IdCard,
    Camera
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { processKYC } from "@/actions/admin";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loading } from "@/components/ui/Loading";
import Image from "next/image";

interface KYCSubmission {
    id: string;
    submitted_at: string;
    document_type: string;
    document_number: string;
    frontUrl: string;
    backUrl?: string;
    selfieUrl: string;
    users: {
        first_name: string;
        last_name: string;
        email: string;
        profile_image?: string | null;
    };
}

interface KYCReviewListProps {
    submissions: KYCSubmission[];
}

export function KYCReviewList({ submissions }: KYCReviewListProps) {
    const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
        setIsLoading(true);
        try {
            const result = await processKYC(id, action, reason);
            if (result.success) {
                toast.success(`Member ${action === 'APPROVE' ? 'Approved' : 'Rejected'} successfully`);
                setIsRejectionModalOpen(false);
                setRejectionReason("");
            } else {
                toast.error(result.error || "Failed to process check");
            }
        } catch {
            toast.error("An error occurred during identity check");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <AnimatePresence>
                {isLoading && (
                    <Loading message="UPDATING IDENTITY RECORDS..." />
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-10">
                <AnimatePresence mode="popLayout">
                    {submissions.map((sub) => (
                        <motion.div
                            key={sub.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-10 rounded-[48px] border border-white/5 glass shadow-2xl space-y-10 group"
                        >
                            {/* User Identity Block */}
                            <div className="flex flex-col sm:flex-row gap-8">
                                <div className="h-20 w-20 rounded-[28px] bg-white/5 border border-white/5 flex items-center justify-center shrink-0 relative overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                    {sub.users.profile_image ? (
                                        <Image
                                            src={sub.users.profile_image}
                                            alt={sub.users.first_name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-2xl font-black text-primary">{sub.users.first_name?.[0]}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-3">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-2xl font-black tracking-tight uppercase truncate">
                                            {sub.users.first_name} {sub.users.last_name}
                                        </h3>
                                        <div className="px-5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/10">
                                            {sub.document_type}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-foreground/30 font-black uppercase tracking-widest">
                                        <span className="flex items-center gap-2"><Mail className="h-4 w-4 opacity-50" /> {sub.users.email}</span>
                                        <span className="flex items-center gap-2"><Calendar className="h-4 w-4 opacity-50" /> {new Date(sub.submitted_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Laboratory */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {/* Front */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 ml-1">
                                        <IdCard className="h-3.5 w-3.5 text-foreground/20" />
                                        <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Document Front</p>
                                    </div>
                                    <div className="relative aspect-4/3 rounded-[32px] overflow-hidden border border-white/5 bg-white/2 group/img shadow-2xl">
                                        <Image src={sub.frontUrl} fill className="object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Front" unoptimized />
                                        <button
                                            onClick={() => setZoomImage(sub.frontUrl)}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex items-center justify-center z-10 backdrop-blur-sm"
                                        >
                                            <div className="h-14 w-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white scale-75 group-hover/img:scale-100 transition-transform duration-500">
                                                <Maximize2 className="h-6 w-6" />
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Back */}
                                {sub.backUrl && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 ml-1">
                                            <Fingerprint className="h-3.5 w-3.5 text-foreground/20" />
                                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Document Back</p>
                                        </div>
                                        <div className="relative aspect-4/3 rounded-[32px] overflow-hidden border border-white/5 bg-white/2 group/img shadow-2xl">
                                            <Image src={sub.backUrl!} fill className="object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Back" unoptimized />
                                            <button
                                                onClick={() => setZoomImage(sub.backUrl!)}
                                                className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex items-center justify-center z-10 backdrop-blur-sm"
                                            >
                                                <div className="h-14 w-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white scale-75 group-hover/img:scale-100 transition-transform duration-500">
                                                    <Maximize2 className="h-6 w-6" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Selfie */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 ml-1">
                                        <Camera className="h-3.5 w-3.5 text-foreground/20" />
                                        <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Identity Selfie</p>
                                    </div>
                                    <div className="relative aspect-4/3 rounded-[32px] overflow-hidden border border-white/5 bg-white/2 group/img shadow-2xl">
                                        <Image src={sub.selfieUrl} fill className="object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Selfie" unoptimized />
                                        <button
                                            onClick={() => setZoomImage(sub.selfieUrl)}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex items-center justify-center z-10 backdrop-blur-sm"
                                        >
                                            <div className="h-14 w-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white scale-75 group-hover/img:scale-100 transition-transform duration-500">
                                                <Maximize2 className="h-6 w-6" />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Metrics */}
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-1 p-6 rounded-[32px] bg-white/5 border border-white/5 flex items-center gap-5 group/metric shadow-2xl">
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-foreground/20 group-hover/metric:text-primary transition-colors">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-1">ID Number</p>
                                        <p className="font-mono font-black text-sm tracking-widest">{sub.document_number}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Command Sequence */}
                            <div className="flex flex-col sm:flex-row gap-5">
                                <button
                                    disabled={isLoading}
                                    onClick={() => handleAction(sub.id, 'APPROVE')}
                                    className="flex-2 h-18 rounded-[28px] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 transition-all disabled:opacity-50"
                                >
                                    <ShieldCheck className="h-5 w-5" />
                                    <span>Approve Member</span>
                                </button>
                                <button
                                    disabled={isLoading}
                                    onClick={() => {
                                        setSelectedSubmission(sub);
                                        setIsRejectionModalOpen(true);
                                    }}
                                    className="flex-1 h-18 rounded-[28px] glass border border-red-500/20 text-red-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <XCircle className="h-5 w-5" />
                                    <span>Reject</span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Rejection Modal */}
            <Modal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                title="REJECTION REASON"
                description="Specify the reason for identity check failure and member rejection."
            >
                <div className="space-y-8 p-2">
                    <div className="relative group">
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="REASONING: Identity document resolution too low / Bio-signature mismatch / Expired credentials..."
                            className="w-full h-40 rounded-[32px] glass border border-white/10 p-6 font-black text-[10px] uppercase tracking-widest focus:border-red-500/50 focus:outline-none transition-all resize-none placeholder:text-foreground/10"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsRejectionModalOpen(false)}
                            className="flex-1 h-16 rounded-2xl glass border border-white/5 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95"
                        >
                            Abort
                        </button>
                        <button
                            disabled={isLoading || !rejectionReason}
                            onClick={() => selectedSubmission && handleAction(selectedSubmission.id, 'REJECT', rejectionReason)}
                            className="flex-2 h-16 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-red-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 active:scale-95"
                        >
                            Finalize Rejection
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Image Zoom Modal */}
            <AnimatePresence>
                {zoomImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setZoomImage(null)}
                        className="fixed inset-0 z-100 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-20 cursor-zoom-out"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative w-full h-full">
                                <Image
                                    src={zoomImage!}
                                    fill
                                    className="object-contain"
                                    alt="Zoomed Document"
                                    unoptimized
                                    priority
                                />
                            </div>
                            <button
                                onClick={() => setZoomImage(null)}
                                className="absolute top-0 right-0 md:-top-10 md:-right-10 h-16 w-16 rounded-full glass border border-white/20 text-white hover:bg-white/10 hover:scale-110 transition-all flex items-center justify-center group"
                            >
                                <X className="h-8 w-8 group-hover:rotate-90 transition-transform duration-500" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
