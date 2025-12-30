"use client";

import { User as UserIcon, Camera, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { updateProfileImage } from "@/actions/profile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
        <div className="max-w-2xl space-y-8">
            <div className="p-5 md:p-8 rounded-3xl md:rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    Profile Information
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border-2 border-dashed border-primary/20 relative overflow-hidden group-hover:border-primary/40 transition-colors">
                            {user?.profile_image ? (
                                <Image
                                    src={user.profile_image}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <UserIcon className="h-10 w-10 text-primary/40" />
                            )}
                            {isUploading && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                                </div>
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
                            className={`absolute -bottom-2 -right-2 p-2.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex-1 space-y-1 text-center sm:text-left">
                        <p className="font-bold text-lg">Your Profile Photo</p>
                        <p className="text-sm text-foreground/40 font-medium">JPG, GIF or PNG. Max size of 2MB</p>
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

            <button disabled className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-foreground/20 font-bold cursor-not-allowed">
                Save Changes (Disabled)
            </button>
        </div>
    );
}
