"use client";

import { useState } from "react";
import {
    CheckCircle2,
    XCircle,
    User,
    Mail,
    FileText,
    Calendar,
    X,
    Maximize2
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
                toast.success(`Submission ${action === 'APPROVE' ? 'Approved' : 'Rejected'} successfully`);
                setIsRejectionModalOpen(false);
                setRejectionReason("");
            } else {
                toast.error(result.error || "Failed to process submission");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {isLoading && (
                    <Loading message="Committing administrative credentials..." />
                )}
            </AnimatePresence>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {submissions.map((sub) => (
                    <div key={sub.id} className="p-8 rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md hover:border-white/10 transition-all group">
                        <div className="flex flex-col sm:flex-row gap-6 mb-8">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 relative overflow-hidden">
                                {sub.users.profile_image ? (
                                    <Image
                                        src={sub.users.profile_image}
                                        alt={sub.users.first_name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <User className="h-8 w-8 text-primary" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold truncate">
                                        {sub.users.first_name} {sub.users.last_name}
                                    </h3>
                                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                        {sub.document_type}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/40 font-medium">
                                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {sub.users.email}</span>
                                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(sub.submitted_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Documents Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">Front of ID</p>
                                <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 group/img">
                                    <Image src={sub.frontUrl} fill className="object-cover" alt="Front" unoptimized />
                                    <button
                                        onClick={() => setZoomImage(sub.frontUrl)}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center z-10"
                                    >
                                        <Maximize2 className="h-6 w-6 text-white" />
                                    </button>
                                </div>
                            </div>
                            {sub.document_type !== 'PASSPORT' && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">Back of ID</p>
                                    <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 group/img">
                                        <Image src={sub.backUrl!} fill className="object-cover" alt="Back" unoptimized />
                                        <button
                                            onClick={() => setZoomImage(sub.backUrl!)}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center z-10"
                                        >
                                            <Maximize2 className="h-6 w-6 text-white" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">Selfie</p>
                                <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 group/img">
                                    <Image src={sub.selfieUrl} fill className="object-cover" alt="Selfie" unoptimized />
                                    <button
                                        onClick={() => setZoomImage(sub.selfieUrl)}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center z-10"
                                    >
                                        <Maximize2 className="h-6 w-6 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ID Number Display */}
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-foreground/20" />
                                <div>
                                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Document Number</p>
                                    <p className="font-mono font-bold">{sub.document_number}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                disabled={isLoading}
                                onClick={() => handleAction(sub.id, 'APPROVE')}
                                className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                <CheckCircle2 className="h-5 w-5" />
                                <span>Approve Access</span>
                            </button>
                            <button
                                disabled={isLoading}
                                onClick={() => {
                                    setSelectedSubmission(sub);
                                    setIsRejectionModalOpen(true);
                                }}
                                className="px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Rejection Modal */}
            <Modal
                isOpen={isRejectionModalOpen}
                onClose={() => setIsRejectionModalOpen(false)}
                title="Reject Submission"
                description="Please provide a clear reason for rejecting this verification request."
            >
                <div className="space-y-6">
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Identity document is blurry, Selfie does not match ID, Document is expired..."
                        className="w-full h-32 rounded-2xl border border-white/10 bg-white/5 p-4 font-medium text-sm focus:border-red-500 focus:outline-none transition-all resize-none"
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsRejectionModalOpen(false)}
                            className="flex-1 py-3.5 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isLoading || !rejectionReason}
                            onClick={() => selectedSubmission && handleAction(selectedSubmission.id, 'REJECT', rejectionReason)}
                            className="flex-1 py-3.5 rounded-xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                        >
                            Confirm Rejection
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
                        className="fixed inset-0 z-100 bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 cursor-pointer"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-5xl w-full aspect-auto rounded-3xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image src={zoomImage!} fill className="object-contain" alt="Zoomed" unoptimized />
                            <button
                                onClick={() => setZoomImage(null)}
                                className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/20 z-20"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
