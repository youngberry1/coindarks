"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { resendVerification } from "@/actions/resend-verification";
import { checkVerification } from "@/actions/check-verification";
import { login } from "@/actions/login";
import { Logo } from "@/components/ui/Logo";

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

    const router = useRouter();
    const searchParams = useSearchParams();
    const isRegistered = searchParams.get("registered") === "true";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setIsUnverified(false);
        setResendMessage({ type: "", text: "" });

        try {
            const data = await login({ email, password });

            if (data?.error) {
                if (data.error === "EmailNotVerified") {
                    setIsUnverified(true);
                } else {
                    setError(data.error);
                }
                setIsLoading(false);
            } else {
                router.refresh();
                router.push("/dashboard");
                // Do not set isLoading(false) here to keep the loader during redirect
            }
        } catch {
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        setResendLoading(true);
        setResendMessage({ type: "", text: "" });

        try {
            const result = await resendVerification(email);
            if (result.error) {
                setResendMessage({ type: "error", text: result.error });
            } else {
                setResendMessage({ type: "success", text: "Verification email sent! Please check your inbox." });
            }
        } catch {
            setResendMessage({ type: "error", text: "Failed to resend. Please try again." });
        } finally {
            setResendLoading(false);
        }
    };

    const handleCheckStatus = async () => {
        if (!email) return;
        setCheckLoading(true);
        setResendMessage({ type: "", text: "" });

        try {
            const result = await checkVerification(email);
            if (result.error) {
                setResendMessage({ type: "error", text: result.error });
            } else if (result.verified) {
                setResendMessage({ type: "success", text: "Email verified! You can now sign in." });
                setIsUnverified(false);
            } else {
                setResendMessage({ type: "error", text: "Email is still not verified. Please check your inbox." });
            }
        } catch {
            setResendMessage({ type: "error", text: "Failed to check status. Please try again." });
        } finally {
            setCheckLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
            {/* Theme Toggle Positioned Top Right */}
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50">
                <ThemeToggle />
            </div>

            {/* Background Decorative Element */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-6 md:space-y-8 glass-morphism p-6 md:p-10 rounded-[32px] md:rounded-3xl shadow-2xl relative z-10"
            >
                <div className="text-center">
                    <Logo className="inline-flex mb-8" />
                    <h2 className="text-3xl font-extrabold text-foreground">Welcome back</h2>
                    <p className="mt-2 text-sm text-foreground/60">
                        Securely log in to manage your digital assets
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {(isRegistered || isUnverified) && (
                        <motion.div
                            key={isUnverified ? "unverified" : "registered"}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`rounded-xl p-4 text-sm border flex flex-col gap-4 transition-colors ${isUnverified
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-green-500/10 text-green-500 border-green-500/20"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {isUnverified ? (
                                    <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                                ) : (
                                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                                )}
                                <p className="leading-relaxed">
                                    {isUnverified
                                        ? "Your email is not verified yet. Please check your inbox or use the options below."
                                        : "Registration successful! Please check your email for verification before logging in."
                                    }
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resendLoading || checkLoading}
                                    className="text-[10px] font-bold uppercase tracking-widest bg-amber-500 text-white px-3 py-2 rounded-lg shadow hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {resendLoading ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : null}
                                    Resend Email
                                </button>

                                {isUnverified && (
                                    <button
                                        type="button"
                                        onClick={handleCheckStatus}
                                        disabled={resendLoading || checkLoading}
                                        className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-3 py-2 rounded-lg shadow hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {checkLoading ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : null}
                                        Check Status
                                    </button>
                                )}
                            </div>

                            {resendMessage.text && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`text-[11px] font-bold p-2.5 rounded-lg border-2 ${resendMessage.type === "success"
                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                        }`}
                                >
                                    {resendMessage.text}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
                                placeholder="Email address"
                                aria-label="Email address"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-12 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
                                placeholder="Password"
                                aria-label="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground/60">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link href="/forgot-password" title="Coming Soon" className="font-medium text-primary hover:text-primary-dark">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative flex w-full justify-center rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-foreground/60">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-bold text-primary hover:text-primary-dark transition-colors">
                        Create account
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
