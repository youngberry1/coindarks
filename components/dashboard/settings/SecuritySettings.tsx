"use client";

import { useState, useEffect } from "react";
import { Lock, CheckCircle2, AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { updatePassword } from "@/actions/settings";
import { Loading } from "@/components/ui/Loading";
import { AnimatePresence } from "framer-motion";

export function SecuritySettings() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Visibility states
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

    // Clear status when user starts typing again
    useEffect(() => {
        if (status !== "idle" || Object.keys(fieldErrors).length > 0) {
            setStatus("idle");
            setMessage("");
            setFieldErrors({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPassword, password, confirmPassword]);

    const handleUpdate = async () => {
        setFieldErrors({});
        let hasError = false;
        const newErrors: { current?: string; new?: string; confirm?: string } = {};

        if (!currentPassword) {
            newErrors.current = "Current password is required";
            hasError = true;
        }
        if (!password) {
            newErrors.new = "New password is required";
            hasError = true;
        }
        if (!confirmPassword) {
            newErrors.confirm = "Please confirm your new password";
            hasError = true;
        } else if (password !== confirmPassword) {
            newErrors.confirm = "Passwords do not match";
            hasError = true;
        }

        if (hasError) {
            setFieldErrors(newErrors);
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
                if (result.error === "Current password is incorrect") {
                    setFieldErrors({ current: "The password you entered is incorrect." });
                } else {
                    setStatus("error");
                    setMessage(result.error || "Failed to update password");
                }
            }
        } catch (err: unknown) {
            console.error("Password update error:", err);
            setStatus("error");
            setMessage("A technical error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVisibility = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(prev => !prev);
    };

    return (
        <div className="w-full lg:max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AnimatePresence>
                {isLoading && (
                    <Loading message="Updating primary security keys..." />
                )}
            </AnimatePresence>
            <div className="p-4 md:p-8 rounded-[24px] md:rounded-[32px] border border-border bg-card-bg/50 backdrop-blur-md shadow-sm dark:shadow-none transition-all">
                <h3 className="text-base md:text-lg font-bold mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    Change Password
                </h3>
                <p className="text-[10px] sm:text-[12px] md:text-sm text-foreground/40 font-medium mb-6 sm:mb-8">Ensure your account is using a long, random password to stay secure.</p>

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
                        <div className="relative">
                            <input
                                type={showCurrent ? "text" : "password"}
                                placeholder="••••••••"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className={`w-full rounded-xl sm:rounded-2xl border bg-card-bg/20 pl-5 pr-12 py-3.5 sm:py-4 font-bold text-sm sm:text-base placeholder:text-foreground/20 focus:outline-none transition-all ${fieldErrors.current
                                    ? "border-red-500/50 focus:border-red-500 bg-red-500/5 text-red-500"
                                    : "border-border focus:border-primary"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility(setShowCurrent)}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.current ? "text-red-400 hover:text-red-500" : "text-foreground/40 hover:text-foreground"}`}
                            >
                                {showCurrent ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                            </button>
                        </div>
                        {fieldErrors.current && (
                            <div className="flex items-center gap-1.5 mt-1.5 ml-1 animate-in slide-in-from-top-1 text-red-500">
                                <AlertCircle className="h-3 w-3" />
                                <span className="text-xs font-bold">{fieldErrors.current}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full rounded-xl sm:rounded-2xl border bg-card-bg/20 pl-5 pr-12 py-3.5 sm:py-4 font-bold text-sm sm:text-base placeholder:text-foreground/20 focus:outline-none transition-all ${fieldErrors.new
                                    ? "border-red-500/50 focus:border-red-500 bg-red-500/5 text-red-500"
                                    : "border-border focus:border-primary"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility(setShowNew)}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.new ? "text-red-400 hover:text-red-500" : "text-foreground/40 hover:text-foreground"}`}
                            >
                                {showNew ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                            </button>
                        </div>
                        {fieldErrors.new && (
                            <div className="flex items-center gap-1.5 mt-1.5 ml-1 animate-in slide-in-from-top-1 text-red-500">
                                <AlertCircle className="h-3 w-3" />
                                <span className="text-xs font-bold">{fieldErrors.new}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full rounded-xl sm:rounded-2xl border bg-card-bg/20 pl-5 pr-12 py-3.5 sm:py-4 font-bold text-sm sm:text-base placeholder:text-foreground/20 focus:outline-none transition-all ${fieldErrors.confirm
                                    ? "border-red-500/50 focus:border-red-500 bg-red-500/5 text-red-500"
                                    : "border-border focus:border-primary"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility(setShowConfirm)}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.confirm ? "text-red-400 hover:text-red-500" : "text-foreground/40 hover:text-foreground"}`}
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                            </button>
                        </div>
                        {fieldErrors.confirm && (
                            <div className="flex items-center gap-1.5 mt-1.5 ml-1 animate-in slide-in-from-top-1 text-red-500">
                                <AlertCircle className="h-3 w-3" />
                                <span className="text-xs font-bold">{fieldErrors.confirm}</span>
                            </div>
                        )}
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
