"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { reset } from "@/actions/reset";
import { Loading } from "@/components/ui/Loading";
import { Logo } from "@/components/ui/Logo";

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
        <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
            <AnimatePresence>{isLoading && <Loading message="Sending reset link..." />}</AnimatePresence>

            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-mesh opacity-30 -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full -z-10 animate-pulse-slow" />


            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-[480px] space-y-10 glass-card p-8 sm:p-12 rounded-[48px] shadow-2xl relative z-10"
            >
                <div className="text-center space-y-6">
                    <Logo className="mx-auto" />
                    <div className="space-y-2">
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">Forgot Password?</h2>
                        <p className="text-sm text-foreground/40 font-medium uppercase tracking-widest">Account Recovery</p>
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
                            <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">Reset Link Sent</p>
                            <p className="text-sm text-foreground/60 font-medium leading-relaxed">
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
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <p className="text-center text-sm text-foreground/50 font-medium leading-relaxed">
                                Enter your email address to receive a password reset link.
                            </p>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-16 rounded-[24px] glass border border-white/5 pl-14 pr-6 text-sm font-bold placeholder:text-foreground/20 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all"
                                    placeholder="Email Address"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-5 rounded-[20px] bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold tracking-tight">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || countdown > 0}
                            className="w-full h-16 rounded-[24px] bg-primary text-white text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-40 group"
                        >
                            <span className="flex items-center justify-center gap-3">
                                {countdown > 0 ? `Retry in ${countdown}s` : "Send Reset Link"}
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>

                        <div className="text-center">
                            <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-primary transition-colors">
                                Remembered your password? <span className="text-primary">Log in</span>
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
