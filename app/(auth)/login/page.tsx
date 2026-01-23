"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldAlert, CheckCircle2, Eye, EyeOff, Sparkles } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { resendVerification } from "@/actions/resend-verification";
import { checkVerification } from "@/actions/check-verification";
import { login } from "@/actions/login";
import { Logo } from "@/components/ui/Logo";
import { Loading } from "@/components/ui/Loading";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function LoginContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isUnverified, setIsUnverified] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [checkLoading, setCheckLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState({ type: "", text: "" });
    const [countdown, setCountdown] = useState(0);

    const router = useRouter();
    const searchParams = useSearchParams();
    const isRegistered = searchParams.get("registered") === "true";

    useEffect(() => {
        const savedEndTime = localStorage.getItem("resendCooldownEnd");
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
                    localStorage.removeItem("resendCooldownEnd");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    useEffect(() => {
        const emailParam = searchParams.get("email");
        if (emailParam) setEmail(emailParam);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setIsUnverified(false);
        setResendMessage({ type: "", text: "" });

        try {
            const data = await login({ email, password });
            if (data?.error) {
                if (data.error === "EmailNotVerified") setIsUnverified(true);
                else setError(data.error);
                setIsLoading(false);
            } else {
                router.refresh();
                router.push("/dashboard");
            }
        } catch {
            setError("Authentication failed. Internal server error.");
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            setResendMessage({ type: "error", text: "Email is required to resend verification." });
            return;
        }
        setResendLoading(true);
        try {
            const result = await resendVerification(email);
            if (result.error) setResendMessage({ type: "error", text: result.error });
            else {
                setResendMessage({ type: "success", text: "Verification link sent to your inbox." });
                setCountdown(60);
                localStorage.setItem("resendCooldownEnd", (Date.now() + 60000).toString());
            }
        } catch {
            setResendMessage({ type: "error", text: "Sending failed. Please try again." });
        } finally {
            setResendLoading(false);
        }
    };

    const handleCheckStatus = async () => {
        if (!email) return;
        setCheckLoading(true);
        try {
            const result = await checkVerification(email);
            if (result.error) setResendMessage({ type: "error", text: result.error });
            else if (result.verified) {
                setResendMessage({ type: "success", text: "Email verified. You can now log in." });
                setIsUnverified(false);
            } else setResendMessage({ type: "error", text: "Verification still pending. Please check your email." });
        } catch {
            setResendMessage({ type: "error", text: "Verification status check failed." });
        } finally {
            setCheckLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
            <AnimatePresence>{isLoading && <Loading message="Logging in..." />}</AnimatePresence>

            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-mesh opacity-30 -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full -z-10 animate-pulse-slow" />


            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-[480px] space-y-10 glass-card p-8 sm:p-12 rounded-[48px] shadow-2xl relative z-10"
            >
                <div className="text-center space-y-6">
                    <Logo className="mx-auto" />
                    <div className="space-y-2">
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">Welcome Back.</h2>
                        <p className="text-sm text-foreground/40 font-medium uppercase tracking-widest">Account Login</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {(isRegistered || isUnverified) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={cn(
                                "rounded-[24px] p-6 border text-sm space-y-4",
                                isUnverified ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            )}
                        >
                            <div className="flex gap-4">
                                {isUnverified ? <ShieldAlert className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
                                <p className="font-bold leading-relaxed tracking-tight">
                                    {isUnverified
                                        ? "Account verification pending. Please check your inbox."
                                        : "Registration successful. Verification link sent."}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendLoading || countdown > 0}
                                    className="px-4 py-2 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-40"
                                >
                                    {countdown > 0 ? `Retry in ${countdown}s` : "Resend Email"}
                                </button>
                                {isUnverified && (
                                    <button
                                        type="button"
                                        onClick={handleCheckStatus}
                                        disabled={checkLoading}
                                        className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                                    >
                                        Check Status
                                    </button>
                                )}
                            </div>
                            {resendMessage.text && (
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{resendMessage.text}</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors z-20" />
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-14"
                                placeholder="Email Address"
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors z-20" />
                            <Input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-14 pr-14"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors z-20"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative h-5 w-5 rounded-md border border-white/10 glass group-hover:border-primary/40 transition-all">
                                <input type="checkbox" className="peer absolute inset-0 opacity-0 cursor-pointer" />
                                <div className="absolute inset-1 rounded-sm bg-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-foreground/30 group-hover:text-foreground/50 transition-colors">Keep Logged In</span>
                        </label>
                        <Link href="/forgot-password" title="Password Recovery" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    {error && (
                        <div className="p-5 rounded-[20px] bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold tracking-tight">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-16 rounded-[24px] bg-primary text-white text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-40 group"
                    >
                        <span className="flex items-center justify-center gap-3">
                            Login <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </form>

                <div className="text-center pt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 mb-4">New to CoinDarks?</p>
                    <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3 rounded-full glass border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-primary">
                        Create Account <Sparkles className="h-3 w-3" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<Loading message="Loading..." />}>
            <LoginContent />
        </Suspense>
    );
}
