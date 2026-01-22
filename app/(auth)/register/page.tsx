"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff, Sparkles, AlertCircle } from "lucide-react";
import { register } from "@/actions/register";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loading } from "@/components/ui/Loading";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/input";


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
            if (result.error) setErrors(result.error);
            else {
                router.push(`/login?registered=true&email=${encodeURIComponent(formData.email)}`);
            }
        } catch {
            setErrors({ message: "Registration failed. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (["firstName", "lastName", "middleName"].includes(name)) {
            const cleanValue = value.replace(/[0-9]/g, "");
            setFormData(prev => ({ ...prev, [name]: cleanValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
            <AnimatePresence>{isLoading && <Loading message="Creating your account..." />}</AnimatePresence>

            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-mesh opacity-30 -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-secondary/5 blur-[160px] rounded-full -z-10 animate-pulse-slow" />

            <div className="absolute top-8 right-8 z-50">
                <ThemeToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-[540px] space-y-10 glass-card p-8 sm:p-14 rounded-[48px] shadow-2xl relative z-10"
            >
                <div className="text-center space-y-6">
                    <Logo className="mx-auto" />
                    <div className="space-y-2">
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">Create Account.</h2>
                        <p className="text-sm text-foreground/40 font-medium uppercase tracking-widest">Join CoinDarks</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        {/* Name Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors z-20" />
                                    <Input
                                        type="text"
                                        name="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="pl-12"
                                        placeholder="First Name"
                                    />
                                </div>
                                {errors?.firstName && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest px-2">{errors.firstName[0]}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <div className="relative group">
                                    <Input
                                        type="text"
                                        name="lastName"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="px-6"
                                        placeholder="Last Name"
                                    />
                                </div>
                                {errors?.lastName && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest px-2">{errors.lastName[0]}</p>}
                            </div>
                        </div>

                        <div className="relative group">
                            <Input
                                type="text"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleChange}
                                className="px-6"
                                placeholder="Middle Name (Optional)"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors z-20" />
                                <Input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-12"
                                    placeholder="Email Address"
                                />
                            </div>
                            {errors?.email && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest px-2">{errors.email[0]}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors z-20" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-12 pr-12"
                                        placeholder="Password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors z-20"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors?.password && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest px-2">{errors.password[0]}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors z-20" />
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="pl-12 pr-12"
                                        placeholder="Confirm Password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors z-20"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors?.confirmPassword && <p className="text-[10px] text-red-500 font-black uppercase tracking-widest px-2">{errors.confirmPassword[0]}</p>}
                            </div>
                        </div>

                        {/* Password Strength */}
                        <div className="px-1">
                            <PasswordStrength
                                password={formData.password}
                                confirmPassword={formData.confirmPassword}
                                showMatch={true}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-4 p-5 rounded-[24px] bg-primary/5 border border-primary/10">
                            <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                            <p className="text-[11px] text-foreground/60 font-medium leading-relaxed">
                                Use your legal name as it appears on your ID documents. These details will be
                                used for account verification.
                            </p>
                        </div>

                        <div className="flex gap-4 p-5 rounded-[24px] bg-secondary/5 border border-secondary/10">
                            <AlertCircle className="h-5 w-5 text-secondary shrink-0" />
                            <p className="text-[11px] text-foreground/60 font-medium leading-relaxed">
                                By signing up, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>

                    {errors?.message && (
                        <div className="p-5 rounded-[20px] bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold tracking-tight">
                            {errors.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-16 rounded-[24px] bg-primary text-white text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:opacity-40 group"
                    >
                        <span className="flex items-center justify-center gap-3">
                            Create Account <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 mb-4">Already have an account?</p>
                    <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 rounded-full glass border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-primary">
                        Login Now <Sparkles className="h-3 w-3" />
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
