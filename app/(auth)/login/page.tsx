"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, ShieldAlert, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { resendVerification } from "@/actions/resend-verification";
import { checkVerification } from "@/actions/check-verification";
import { login } from "@/actions/login";
import { Loading } from "@/components/ui/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AnimatePresence, motion } from "framer-motion";
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
        <AuthLayout title="Welcome Back" subtitle="Log in to your account">
            <AnimatePresence>{isLoading && <Loading message="Authorizing secure access..." />}</AnimatePresence>

            <div className="space-y-6">
                <AnimatePresence mode="wait">
                    {(isRegistered || isUnverified) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={cn(
                                "rounded-2xl p-4 border text-sm space-y-3 overflow-hidden",
                                isUnverified ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                            )}
                        >
                            <div className="flex gap-3">
                                {isUnverified ? <ShieldAlert className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
                                <p className="font-bold leading-relaxed tracking-tight text-xs sm:text-sm">
                                    {isUnverified
                                        ? "Account verification pending. Check your inbox."
                                        : "Registration successful. Verification link sent."}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendLoading || countdown > 0}
                                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-40"
                                >
                                    {countdown > 0 ? `Retry in ${countdown}s` : "Resend Email"}
                                </button>
                                {isUnverified && (
                                    <button
                                        type="button"
                                        onClick={handleCheckStatus}
                                        disabled={checkLoading}
                                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2"
                                    >
                                        {checkLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                                        Check Status
                                    </button>
                                )}
                            </div>
                            {resendMessage.text && (
                                <p className={cn("text-[10px] font-bold uppercase tracking-wider", resendMessage.type === 'error' ? 'text-red-400' : 'text-emerald-400')}>
                                    {resendMessage.text}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors duration-300 z-20" />
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-11 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all duration-300 rounded-xl"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors duration-300 z-20" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-11 pr-11 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all duration-300 rounded-xl"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors z-20 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative h-4 w-4 rounded border border-white/20 bg-white/5 group-hover:border-primary/50 transition-all duration-300 flex items-center justify-center">
                                    <input type="checkbox" className="peer absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                    <div className="hidden peer-checked:block w-2.5 h-2.5 bg-primary rounded-[2px]" />
                                </div>
                                <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">Keep me signed in</span>
                            </label>
                        </div>
                        <Link
                            href="/forgot-password"
                            className="font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider text-[10px]"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold tracking-tight animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none group"
                    >
                        <span className="flex items-center justify-center gap-2">
                            Sign In <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </form>

                <div className="pt-4 text-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background/0 backdrop-blur-xl px-2 text-muted-foreground font-bold tracking-widest">
                                Or
                            </span>
                        </div>
                    </div>

                    <Link
                        href="/register"
                        className="block w-full"
                    >
                        <button className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-black uppercase tracking-[0.2em] text-xs transition-all duration-300">
                            Create New Account
                        </button>
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<Loading message="Loading..." />}>
            <LoginContent />
        </Suspense>
    );
}
