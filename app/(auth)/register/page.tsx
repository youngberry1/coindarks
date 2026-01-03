"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { register } from "@/actions/register";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loading } from "@/components/ui/Loading";
import { Logo } from "@/components/ui/Logo";
import { AnimatePresence } from "framer-motion";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
        message?: string;
    } | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors(null);

        try {
            const result = await register(formData);

            if (result.error) {
                setErrors(result.error);
            } else {
                // Redirect to login or verification page with email pre-filled
                router.push(`/login?registered=true&email=${encodeURIComponent(formData.email)}`);
            }
        } catch {
            setErrors({ message: "Something went wrong. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
            <AnimatePresence>
                {isLoading && (
                    <Loading message="Initializing your account..." />
                )}
            </AnimatePresence>

            {/* Theme Toggle Positioned Top Right */}
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50">
                <ThemeToggle />
            </div>

            {/* Background Decorative Element */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-6 md:space-y-8 glass-morphism p-6 md:p-10 rounded-[32px] md:rounded-3xl shadow-2xl relative z-10"
            >
                <div className="text-center">
                    <Logo className="inline-flex mb-8" />
                    <h2 className="text-3xl font-extrabold text-foreground">Create Account</h2>
                    <p className="mt-2 text-sm text-foreground/60">
                        Join the most trusted exchange for Ghana & Nigeria
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative col-span-2 sm:col-span-1">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                                <input
                                    type="text"
                                    name="firstName"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
                                    placeholder="First Name"
                                    aria-label="First Name"
                                />
                                {errors?.firstName && <p className="mt-1 text-xs text-red-500 ml-2">{errors.firstName[0]}</p>}
                            </div>
                            <div className="relative col-span-2 sm:col-span-1">
                                <input
                                    type="text"
                                    name="lastName"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-4 pr-4 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
                                    placeholder="Last Name"
                                    aria-label="Last Name"
                                />
                                {errors?.lastName && <p className="mt-1 text-xs text-red-500 ml-2">{errors.lastName[0]}</p>}
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-4 pr-4 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
                                placeholder="Middle Name (Optional)"
                                aria-label="Middle Name"
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
                                placeholder="Email address"
                                aria-label="Email address"
                            />
                            {errors?.email && <p className="mt-1 text-xs text-red-500 ml-2">{errors.email[0]}</p>}
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
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
                            {errors?.password && <p className="mt-1 text-xs text-red-500 ml-2">{errors.password[0]}</p>}
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-12 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
                                placeholder="Confirm Password"
                                aria-label="Confirm Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                            {errors?.confirmPassword && <p className="mt-1 text-xs text-red-500 ml-2">{errors.confirmPassword[0]}</p>}
                        </div>

                        {/* Password Strength Indicators */}
                        <div className="pt-2">
                            <PasswordStrength
                                password={formData.password}
                                confirmPassword={formData.confirmPassword}
                                showMatch={true}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0" />
                            <div>
                                <p className="text-[12px] font-bold text-amber-500 uppercase tracking-wider mb-1">Important: Official Identity</p>
                                <p className="text-[12px] text-foreground/60 leading-tight">
                                    Please use your **real name** as it appears on your official ID. You will not be able to change your name or email after registration.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                        <p className="text-[12px] text-foreground/60 leading-tight">
                            By creating an account, you agree to our Terms of Service and Privacy Policy. Password data is encrypted.
                        </p>
                    </div>

                    {errors?.message && (
                        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                            {errors.message}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative flex w-full justify-center rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            Create Account
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-foreground/60">
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-primary hover:text-primary-dark transition-colors">
                        Log in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

