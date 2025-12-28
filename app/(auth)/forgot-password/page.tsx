"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { reset } from "@/actions/reset";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const result = await reset({ email });
            if (result.error) {
                setError(result.error);
            } else if (result.success) {
                setSuccess(result.success);
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
            {/* Theme Toggle Positioned Top Right */}
            <div className="absolute top-8 right-8 z-50">
                <ThemeToggle />
            </div>

            {/* Background Decorative Element */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 glass-morphism p-10 rounded-3xl shadow-2xl relative z-10"
            >
                <div className="text-center">
                    <Logo className="inline-flex mb-8" />
                    <h2 className="text-3xl font-extrabold text-foreground">Forgot Password?</h2>
                    <p className="mt-2 text-sm text-foreground/60">
                        Enter your email address to receive a reset link
                    </p>
                </div>

                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl bg-green-500/10 p-6 border border-green-500/20 text-center space-y-4"
                    >
                        <div className="flex justify-center">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                        </div>
                        <p className="text-green-500 font-medium">
                            {success}
                        </p>
                        <p className="text-sm text-foreground/60">
                            We&apos;ve sent an email to <b>{email}</b>. Please check your inbox and follow the instructions.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                        >
                            Back to login
                        </Link>
                    </motion.div>
                ) : (
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
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                                <AlertCircle className="h-4 w-4 shrink-0" />
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
                                        Send Reset Link
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-center text-sm text-foreground/60">
                            Remember your password?{" "}
                            <Link href="/login" className="font-bold text-primary hover:text-primary-dark transition-colors">
                                Log in
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
