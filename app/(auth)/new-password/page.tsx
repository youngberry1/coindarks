"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { newPassword } from "@/actions/new-password";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Loading } from "@/components/ui/Loading";
import { AuthLayout } from "@/components/auth/AuthLayout";

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
        <AuthLayout title="New Password" subtitle="Create a strong password">
            <AnimatePresence>{isLoading && <Loading message="Resetting password..." />}</AnimatePresence>

            {success ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[24px] bg-emerald-500/10 p-6 border border-emerald-500/20 text-center space-y-5"
                >
                    <div className="flex justify-center">
                        <div className="h-14 w-14 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">Password Updated</p>
                        <p className="text-xs sm:text-sm text-foreground/60 font-medium leading-relaxed">
                            Your password has been successfully updated.
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
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 rounded-xl bg-white/5 border border-white/5 pl-11 pr-11 text-sm font-medium placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                                placeholder="New Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {fieldErrors?.password && (
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest px-2">{fieldErrors.password[0]}</p>
                        )}

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full h-12 rounded-xl bg-white/5 border border-white/5 pl-11 pr-11 text-sm font-medium placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                                placeholder="Confirm Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {fieldErrors?.confirmPassword && (
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest px-2">{fieldErrors.confirmPassword[0]}</p>
                        )}

                        <div className="px-1">
                            <PasswordStrength password={password} confirmPassword={confirmPassword} showMatch />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold tracking-tight">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 group"
                    >
                        <span className="flex items-center justify-center gap-2">
                            Update Password <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>

                    <div className="text-center">
                        <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-primary transition-colors">
                            Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
}

export default function NewPasswordPage() {
    return (
        <Suspense fallback={<Loading message="Loading..." />}>
            <NewPasswordContent />
        </Suspense>
    );
}
