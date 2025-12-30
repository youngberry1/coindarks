"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { updatePassword } from "@/actions/settings"; // Need to create this
import { toast } from "sonner";

export function SecuritySettings() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async () => {
        if (!currentPassword || !password || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const result = await updatePassword(currentPassword, password);
            if (result.success) {
                toast.success(result.success);
                setCurrentPassword("");
                setPassword("");
                setConfirmPassword("");
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-8">
            <div className="p-8 rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Change Password
                </h3>
                <p className="text-sm text-foreground/40 font-medium mb-8">Ensure your account is using a long, random password to stay secure.</p>

                <div className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Current Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold placeholder:text-foreground/20 focus:border-primary focus:outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">New Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold placeholder:text-foreground/20 focus:border-primary focus:outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Confirm New Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold placeholder:text-foreground/20 focus:border-primary focus:outline-none transition-all"
                        />
                    </div>

                    <div className="pt-2">
                        <PasswordStrength password={password} confirmPassword={confirmPassword} showMatch={true} />
                    </div>
                </div>
            </div>

            <button
                onClick={handleUpdate}
                disabled={isLoading}
                className="px-8 py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
                {isLoading ? "Updating..." : "Update Password"}
            </button>
        </div>
    );
}
