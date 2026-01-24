"use client";

import { User as UserIcon, Camera, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { updateProfileImage } from "@/actions/profile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/ui/LoadingSpinner";
import { AnimatePresence } from "framer-motion";

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_image?: string | null;
}

interface GeneralSettingsProps {
    user: User;
}

export function GeneralSettings({ user }: GeneralSettingsProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File is too large. Max size is 2MB.");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        setIsUploading(true);
        const promise = updateProfileImage(formData);

        toast.promise(promise, {
            loading: 'Uploading image...',
            success: (data) => {
                if (data.error) throw new Error(data.error);
                router.refresh();
                return 'Profile photo updated!';
            },
            error: (err) => err.message || 'Failed to upload image',
        });

        try {
            await promise;
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    return (
        <div className="w-full lg:max-w-2xl space-y-8">
            <AnimatePresence>
                {isUploading && (
                    <Loading message="Processing request..." />
                )}
            </AnimatePresence>
            <div className="p-4 md:p-8 rounded-[24px] md:rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    Profile Information
                </h3>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-8">
                    <div className="relative group shrink-0">
                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl sm:rounded-3xl bg-primary/10 flex items-center justify-center text-primary border-2 border-dashed border-primary/20 relative overflow-hidden group-hover:border-primary/40 transition-colors">
                            {user?.profile_image ? (
                                <Image
                                    src={user.profile_image}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary/40" />
                            )}

                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            onClick={handleUploadClick}
                            disabled={isUploading}
                            className={`absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Camera className="h-3.5 sm:h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex-1 space-y-1 text-center sm:text-left min-w-0">
                        <p className="font-bold text-base sm:text-lg truncate sm:whitespace-normal">Your Profile Photo</p>
                        <p className="text-[11px] sm:text-sm text-foreground/40 font-medium">JPG, GIF or PNG. Max size of 2MB</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 opacity-50 cursor-not-allowed">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">First Name</label>
                            <input disabled value={user?.first_name || ""} className="w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 font-bold text-sm" />
                        </div>
                        <div className="space-y-1.5 opacity-50 cursor-not-allowed">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Last Name</label>
                            <input disabled value={user?.last_name || ""} className="w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 font-bold text-sm" />
                        </div>
                    </div>
                    <div className="space-y-1.5 opacity-50 cursor-not-allowed">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Email Address</label>
                        <input disabled value={user?.email || ""} className="w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 font-bold text-sm" />
                    </div>
                    <p className="text-[11px] text-amber-500/60 font-medium flex items-center gap-1.5 ml-1 pt-2">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Names and email cannot be changed as they are verified with your ID.
                    </p>
                </div>
            </div>

            <button disabled className="w-full sm:w-auto px-8 py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-foreground/20 font-bold cursor-not-allowed text-sm">
                Save Changes (Disabled)
            </button>
        </div>
    );
}
