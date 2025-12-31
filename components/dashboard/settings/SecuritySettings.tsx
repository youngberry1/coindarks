"use client";

import { useState, useEffect } from "react";
import { Lock, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { updatePassword } from "@/actions/settings";
import { Loading } from "@/components/ui/Loading";
import { AnimatePresence } from "framer-motion";

export function SecuritySettings() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    // Clear status when user starts typing again
    useEffect(() => {
        if (status !== "idle") {
            setStatus("idle");
            setMessage("");
        }
    }, [currentPassword, password, confirmPassword, status]);

    const handleUpdate = async () => {
        if (!currentPassword || !password || !confirmPassword) {
            setStatus("error");
            setMessage("Please fill in all fields");
            return;
        }
        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setStatus("idle");

        try {
            const result = await updatePassword(currentPassword, password);

            if (result.success) {
                setStatus("success");
                setMessage(result.success);
                setCurrentPassword("");
                setPassword("");
                setConfirmPassword("");

                // Keep success state for 5 seconds then go back to idle
                setTimeout(() => {
                    if (status === "success") setStatus("idle");
                }, 5000);
            } else {
                setStatus("error");
                setMessage(result.error || "Failed to update password");
            }
        } catch (err: unknown) {
            console.error("Password update error:", err);
            setStatus("error");
            setMessage("A technical error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AnimatePresence>
                {isLoading && (
                    <Loading message="Updating primary security keys..." />
                )}
            </AnimatePresence>
            <div className="p-8 rounded-[32px] border border-border bg-card-bg/50 backdrop-blur-md shadow-sm dark:shadow-none transition-all">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Change Password
                </h3>
                <p className="text-sm text-foreground/40 font-medium mb-8">Ensure your account is using a long, random password to stay secure.</p>

                <div className="space-y-6">
                    {/* Status Message Area */}
                    {status !== "idle" && (
                        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in zoom-in-95 duration-300 ${status === "success"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                            }`}>
                            {status === "success" ? <ShieldCheck className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                            <p className="text-sm font-bold">{message}</p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Current Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full rounded-2xl border border-border bg-card-bg/20 px-5 py-4 font-bold placeholder:text-foreground/20 focus:border-primary focus:outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">New Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-2xl border border-border bg-card-bg/20 px-5 py-4 font-bold placeholder:text-foreground/20 focus:border-primary focus:outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Confirm New Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-2xl border border-border bg-card-bg/20 px-5 py-4 font-bold placeholder:text-foreground/20 focus:border-primary focus:outline-none transition-all"
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
                className={`px-10 py-4 rounded-2xl font-bold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto ${status === "success"
                    ? "bg-emerald-500 text-white shadow-emerald-500/20 scale-[1.05]"
                    : "bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
            >
                {status === "success" ? (
                    <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Password Updated!</span>
                    </>
                ) : (
                    <>
                        <Lock className="h-4 w-4" />
                        <span>Update Password</span>
                    </>
                )}
            </button>
        </div>
    );
}
