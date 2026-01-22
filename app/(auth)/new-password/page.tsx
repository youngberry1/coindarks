"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { newPassword } from "@/actions/new-password";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loading } from "@/components/ui/Loading";
import { Logo } from "@/components/ui/Logo";

function NewPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{
        password?: string[];
        confirmPassword?: string[];
    } | null>(null);
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setFieldErrors(null);
        setSuccess("");

        try {
            const result = await newPassword({ password, confirmPassword }, token);
            if (result.fieldErrors) setFieldErrors(result.fieldErrors);
            else if (result.error) setError(result.error);
            else if (result.success) setSuccess(result.success);
        } catch {
            setError("Password reset failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
            <AnimatePresence>{isLoading && <Loading message="Resetting password..." />}</AnimatePresence>

            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-mesh opacity-30 -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full -z-10 animate-pulse-slow" />

            <div className="absolute top-8 right-8 z-50">
                <ThemeToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-[480px] space-y-10 glass-card p-8 sm:p-12 rounded-[48px] shadow-2xl relative z-10"
            >
                <div className="text-center space-y-6">
                    <Logo className="mx-auto" />
                    <div className="space-y-2">
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">New Password.</h2>
                        <p className="text-sm text-foreground/40 font-medium uppercase tracking-widest">Reset your account password</p>
                    </div>
                </div>

                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-[32px] bg-emerald-500/10 p-8 border border-emerald-500/20 text-center space-y-6"
                    >
                        <div className="flex justify-center">
                            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">Password Updated</p>
                            <p className="text-sm text-foreground/60 font-medium leading-relaxed">
                                Your password has been successfully updated. You can now log in with your new password.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-full glass border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-primary"
                        >
                            Login Now
                        </Link>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-16 rounded-[24px] glass border border-white/5 pl-14 pr-14 text-sm font-bold placeholder:text-foreground/20 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="New Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {fieldErrors?.password && (
                                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest px-4 italic">{fieldErrors.password[0]}</p>
                            )}

                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full h-16 rounded-[24px) glass border border-white/5 pl-14 pr-14 text-sm font-bold placeholder:text-foreground/20 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="Confirm Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {fieldErrors?.confirmPassword && (
                                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest px-4 italic">{fieldErrors.confirmPassword[0]}</p>
                            )}
                        </div>

                        <div className="px-2">
                            <PasswordStrength password={password} confirmPassword={confirmPassword} showMatch />
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-5 rounded-[20px] bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold tracking-tight">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-16 rounded-[24px] bg-primary text-white text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-40 group"
                        >
                            <span className="flex items-center justify-center gap-3">
                                Update Password <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>

                        <div className="text-center">
                            <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-primary transition-colors">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}

export default function NewPasswordPage() {
    return (
        <Suspense fallback={<Loading message="Loading..." />}>
            <NewPasswordContent />
        </Suspense>
    );
}
