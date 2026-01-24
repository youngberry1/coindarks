"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { reset } from "@/actions/reset";
import { Loading } from "@/components/ui/LoadingSpinner";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        const savedEndTime = localStorage.getItem("resetCooldownEnd");
        if (savedEndTime) {
            const remaining = Math.ceil((parseInt(savedEndTime) - Date.now()) / 1000);
            if (remaining > 0) setCountdown(remaining);
        }
    }, []);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    localStorage.removeItem("resetCooldownEnd");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const result = await reset({ email });
            if (result.error) setError(result.error);
            else if (result.success) {
                setSuccess(result.success);
                setCountdown(60);
                localStorage.setItem("resetCooldownEnd", (Date.now() + 60000).toString());
            }
        } catch {
            setError("Reset request failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Forgot Password?" subtitle="Account Recovery">
            <AnimatePresence>{isLoading && <Loading message="Recovering your account..." />}</AnimatePresence>

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
                        <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">Reset Link Sent</p>
                        <p className="text-xs sm:text-sm text-foreground/60 font-medium leading-relaxed">
                            Instructions sent to <span className="text-foreground font-bold">{email}</span>.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full glass border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-primary"
                    >
                        Back to Login
                    </Link>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <p className="text-center text-xs text-foreground/50 font-medium leading-relaxed max-w-[280px] mx-auto">
                            Enter your email address to receive a password reset link.
                        </p>
                        <div className="space-y-1.5">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 rounded-xl bg-white/5 border border-white/5 pl-11 pr-4 text-sm font-medium placeholder:text-foreground/20 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                                    placeholder="Email Address"
                                />
                            </div>
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
                        disabled={isLoading || countdown > 0}
                        className="w-full h-12 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 group"
                    >
                        <span className="flex items-center justify-center gap-2">
                            {countdown > 0 ? `Retry in ${countdown}s` : "Send Reset Link"}
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>

                    <div className="text-center">
                        <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-primary transition-colors">
                            Remembered your password? <span className="text-primary">Log in</span>
                        </Link>
                    </div>
                </form>
            )}
        </AuthLayout>
    );
}
