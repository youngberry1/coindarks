"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ShieldCheck,
    Upload,
    FileText,
    CheckCircle2,
    X,
    ChevronRight,
    Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { submitKYC } from "@/actions/kyc";
import { Loading } from "@/components/ui/Loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChangeEvent } from "react";

// Define locally since we removed react-dropzone
export interface FileRejection {
    file: File;
    errors: { code: string; message: string }[];
}

const STEPS = ["ID Type", "Details", "Upload Photos", "Complete"];

export function KYCForm() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const router = useRouter();

    // Auto-redirect effect when step 3 (Complete) is reached
    useEffect(() => {
        if (currentStep === 3) {
            const timer = setTimeout(() => {
                setIsRedirecting(true);
                // Short delay to show redirecting state before actual push
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1500);
            }, 2000); // 2 seconds delay before starting redirect sequence

            return () => clearTimeout(timer);
        }
    }, [currentStep, router]);

    // Form State
    const [formData, setFormData] = useState({
        documentType: "",
        documentNumber: "",
        frontImage: null as File | null,
        backImage: null as File | null,
        selfieImage: null as File | null,
    });

    const [previews, setPreviews] = useState({
        front: "",
        back: "",
        selfie: "",
    });



    // Track active URLs for cleanup
    // Removed activeUrlsRef as we are switching to Data URLs which are managed by JS garbage collector automatically
    // No manual cleanup needed for base64 strings

    // Cleanup object URLs to avoid memory leaks ONLY on unmount


    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const onDrop = useCallback((id: 'front' | 'back' | 'selfie', acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Use FileReader for maximum compatibility (especially on mobile/Android)
        // Blob URLs can sometimes be finicky or get revoked prematurely on mobile browsers.
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
                setPreviews(prev => ({ ...prev, [id]: result }));
            }
        };
        reader.readAsDataURL(file);

        setFormData(prev => ({ ...prev, [`${id}Image`]: file }));
    }, []);

    const onDropRejected = useCallback((id: 'front' | 'back' | 'selfie', fileRejections: FileRejection[]) => {
        const rejection = fileRejections[0];
        if (rejection) {
            const error = rejection.errors[0];
            if (error.code === 'file-too-large') {
                toast.error("File is too large. Please upload an image smaller than 5MB.");
            } else if (error.code === 'file-invalid-type') {
                // Check if it's a video file by extension for a more specific error
                const isVideo = rejection.file.type.startsWith('video/');
                if (isVideo) {
                    toast.error("Video files are not allowed. Please upload a clear image (JPG, PNG).");
                } else {
                    toast.error("Unsupported file type. Please stick to JPG, PNG, or WebP images.");
                }
            } else {
                toast.error(`Error uploading image: ${error.message}`);
            }
        }
    }, []);

    const removeImage = (id: 'front' | 'back' | 'selfie') => {
        setFormData(prev => ({ ...prev, [`${id}Image`]: null }));
        setPreviews(prev => ({ ...prev, [id]: "" }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const submitData = new FormData();
            submitData.append("documentType", formData.documentType);
            submitData.append("documentNumber", formData.documentNumber);
            if (formData.frontImage) submitData.append("front", formData.frontImage);
            if (formData.backImage) submitData.append("back", formData.backImage);
            if (formData.selfieImage) submitData.append("selfie", formData.selfieImage);

            // Debug: Check payload keys
            console.log("Submitting KYC Data Keys:", Array.from(submitData.keys()));

            const result = await submitKYC(submitData);

            if (result.success) {
                toast.success("KYC Submitted Successfully!");
                setCurrentStep(3); // Complete
            } else {
                console.error("Server returned error:", result.error);
                toast.error(result.error || "Submission failed");
            }
        } catch (error) {
            console.error("KYC Client Error Detailed:", error);
            if (error instanceof Error) {
                toast.error(`Error: ${error.message}`);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
            <AnimatePresence>
                {isLoading && (
                    <Loading message="Transmitting encrypted identification documents..." />
                )}
            </AnimatePresence>

            {/* Steps Progress */}
            <div className="flex items-center justify-between max-w-2xl mx-auto relative px-4">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -z-10 -translate-y-1/2" />
                {STEPS.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-lg ${idx <= currentStep ? "bg-primary text-white scale-110 shadow-primary/20" : "bg-white/10 text-foreground/40"
                            }`}>
                            {idx < currentStep ? <Check className="h-5 w-5" /> : idx + 1}
                        </div>
                        <span className={`text-[10px] uppercase font-black tracking-widest ${idx <= currentStep ? "text-primary" : "text-foreground/20"}`}>{step}</span>
                    </div>
                ))}
            </div>

            <div className="p-8 md:p-12 rounded-[40px] border border-white/5 bg-card-bg/50 backdrop-blur-xl relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center max-w-md mx-auto">
                                <h1 className="text-2xl font-black mb-3">Choose ID Type</h1>
                                <p className="text-sm text-foreground/50 font-medium">Select the document you wish to use for verification.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {
                                    [
                                        { id: "PASSPORT", name: "International Passport", desc: "Front Page Required" },
                                        { id: "LICENSE", name: "Driver's License", desc: "Front & Back required" },
                                        { id: "NATIONAL_ID", name: "National ID Card", desc: "Front & Back required" },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, documentType: type.id }));
                                                handleNext();
                                            }}
                                            className={`p-8 rounded-3xl border transition-all text-left flex flex-col items-start gap-4 group ${formData.documentType === type.id
                                                ? "bg-primary/10 border-primary shadow-lg shadow-primary/5"
                                                : "bg-white/5 border-white/5 hover:bg-white/10"
                                                }`}
                                        >
                                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${formData.documentType === type.id ? "bg-primary text-white" : "bg-white/5 text-foreground/40 group-hover:text-primary"
                                                }`}>
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold mb-1">{type.name}</p>
                                                <p className="text-xs text-foreground/40 font-medium">{type.desc}</p>
                                            </div>
                                        </button>
                                    ))
                                }
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8 max-w-md mx-auto"
                        >
                            <div className="text-center">
                                <h1 className="text-2xl font-black mb-3">Document Details</h1>
                                <p className="text-sm text-foreground/50 font-medium">Enter the ID number exactly as it appears.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">{formData.documentType.replace('_', ' ')} Number</label>
                                    <input
                                        type="text"
                                        value={formData.documentNumber}
                                        onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
                                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-5 font-bold focus:border-primary focus:outline-none transition-all"
                                        placeholder="Enter ID Number"
                                    />
                                </div>
                                <button
                                    disabled={!formData.documentNumber}
                                    onClick={handleNext}
                                    className="w-full py-5 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    Next Step <ChevronRight className="h-5 w-5" />
                                </button>
                                <button onClick={handleBack} className="w-full py-4 text-sm font-bold text-foreground/40 hover:text-foreground">
                                    Go Back
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <h1 className="text-2xl font-black mb-3">Upload Documents</h1>
                                <p className="text-sm text-foreground/50 font-medium max-w-md mx-auto">
                                    Upload clear photos of your {formData.documentType === 'PASSPORT' ? 'Passport' : 'ID'} and a selfie holding the {formData.documentType === 'PASSPORT' ? 'Passport' : 'ID'}.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ImageUpload
                                    label={formData.documentType === 'PASSPORT' ? "Front of Passport" : "Front of ID"}
                                    preview={previews.front}
                                    onDrop={(files) => onDrop('front', files)}
                                    onRejected={(rejections) => onDropRejected('front', rejections)}
                                    onRemove={() => removeImage('front')}
                                />

                                {formData.documentType !== "PASSPORT" && (
                                    <ImageUpload
                                        label="Back of ID"
                                        preview={previews.back}
                                        onDrop={(files) => onDrop('back', files)}
                                        onRejected={(rejections) => onDropRejected('back', rejections)}
                                        onRemove={() => removeImage('back')}
                                    />
                                )}

                                <div className={`w-full ${formData.documentType === 'PASSPORT' ? '' : 'md:col-span-2 max-w-md mx-auto'}`}>
                                    <ImageUpload
                                        label={formData.documentType === 'PASSPORT' ? "Selfie with Passport" : "Selfie with ID"}
                                        preview={previews.selfie}
                                        onDrop={(files) => onDrop('selfie', files)}
                                        onRejected={(rejections) => onDropRejected('selfie', rejections)}
                                        onRemove={() => removeImage('selfie')}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center gap-4">
                                <button onClick={handleBack} className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-foreground/40 hover:text-foreground">
                                    Go Back
                                </button>
                                <button
                                    disabled={
                                        isLoading ||
                                        !formData.frontImage ||
                                        (!formData.backImage && formData.documentType !== "PASSPORT") ||
                                        !formData.selfieImage
                                    }
                                    onClick={handleSubmit}
                                    className="w-full sm:flex-1 py-5 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3"
                                >
                                    <ShieldCheck className="h-5 w-5" /> Submit for Verification
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-10 space-y-8"
                        >
                            <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border-4 border-emerald-500/20">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black mb-3 text-emerald-500">Submission Received!</h1>
                                <p className="text-foreground/50 font-medium max-w-sm mx-auto">Your verification is being processed. You will be notified via email once our team reviews your documents.</p>
                            </div>

                            {isRedirecting ? (
                                <div className="flex flex-col items-center gap-3 animate-pulse">
                                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm font-bold text-primary">Redirecting back to dashboard...</p>
                                </div>
                            ) : (
                                <Link href="/dashboard" className="inline-flex px-10 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all">
                                    Return to Dashboard
                                </Link>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ImageUpload({
    label,
    preview,
    onDrop,
    onRejected,
    onRemove
}: {
    label: string;
    preview: string;
    onDrop: (files: File[]) => void;
    onRejected: (rejections: FileRejection[]) => void;
    onRemove: () => void;
}) {
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Custom Validation since we removed react-dropzone
        // 1. Check File Size (5MB = 5 * 1024 * 1024)
        if (file.size > 5 * 1024 * 1024) {
            onRejected([{ file, errors: [{ code: 'file-too-large', message: 'File is larger than 5MB' }] }]);
            // Clear input value so selecting the same file again triggers onChange
            e.target.value = "";
            return;
        }

        // 2. Check File Type
        // Quick check for video to give specific error
        if (file.type.startsWith('video/')) {
            onRejected([{ file, errors: [{ code: 'file-invalid-type', message: 'Videos not allowed' }] }]);
            e.target.value = "";
            return;
        }

        // Looser check or explicit check. We know mobile browsers sometimes give weird types, 
        // but checking startsWith('image/') is usually safe enough combined with accept attr.
        // However, user specifically mentioned "popular image formats".
        // Let's stick to the accept attribute doing the heavy lifting in the UI, 
        // and a loose image check here just to catch non-images.
        if (!file.type.startsWith('image/')) {
            onRejected([{ file, errors: [{ code: 'file-invalid-type', message: 'File is not an image' }] }]);
            e.target.value = "";
            return;
        }

        onDrop([file]);
        e.target.value = ""; // Reset for re-selection possibility
    };

    const [hasError, setHasError] = useState(false);

    // Reset error state when preview changes
    if (preview && hasError) {
        setHasError(false);
    }

    if (preview && !hasError) {
        return (
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group bg-black/20">
                <Image
                    src={preview}
                    alt={label}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={() => {
                        setHasError(true);
                        // Also notify parent to remove the bad file
                        onRemove();
                        toast.error("Failed to load image preview. The file might be corrupted.");
                    }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4">
                    <button onClick={onRemove} className="p-3 rounded-full bg-red-500 text-white shadow-lg hover:scale-110 active:scale-90 transition-all">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <label className="group relative aspect-video rounded-3xl border-2 border-dashed border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10 transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer active:scale-[0.98]">
            <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={handleFileChange}
            />
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6" />
            </div>
            <p className="font-bold mb-1">{label}</p>
            <p className="text-xs text-foreground/40 font-medium">Tap to upload image</p>
            <p className="text-[10px] text-foreground/30 mt-2">Max 5MB • JPG, PNG, WebP</p>
        </label>
    );
}
