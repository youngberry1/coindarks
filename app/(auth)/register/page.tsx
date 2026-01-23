"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { register } from "@/actions/register";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Loading } from "@/components/ui/Loading";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/auth/AuthLayout";
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
        <AuthLayout title="Create Account" subtitle="Join CoinDarks today">
            <AnimatePresence>{isLoading && <Loading message="Creating your account..." />}</AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                    {/* Personal Info Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-1 border-b border-white/5">
                            <User className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Personal Info</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Input
                                    type="text"
                                    name="firstName"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="h-11 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl"
                                    placeholder="First Name"
                                />
                                {errors?.firstName && <p className="text-[10px] text-red-400 font-bold px-1">{errors.firstName[0]}</p>}
                            </div>
                            <div className="space-y-1">
                                <Input
                                    type="text"
                                    name="lastName"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="h-11 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl"
                                    placeholder="Last Name"
                                />
                                {errors?.lastName && <p className="text-[10px] text-red-400 font-bold px-1">{errors.lastName[0]}</p>}
                            </div>
                        </div>
                        <Input
                            type="text"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleChange}
                            className="h-11 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl"
                            placeholder="Middle Name (Optional)"
                        />
                    </div>

                    {/* Account Info Section */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2 pb-1 border-b border-white/5">
                            <Mail className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Credentials</span>
                        </div>

                        <div className="space-y-1">
                            <Input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="h-11 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl"
                                placeholder="Email Address"
                            />
                            {errors?.email && <p className="text-[10px] text-red-400 font-bold px-1">{errors.email[0]}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="relative group space-y-1">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="h-11 pr-10 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl"
                                    placeholder="Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[1.4rem] -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors z-20"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                {errors?.password && <p className="text-[10px] text-red-400 font-bold px-1">{errors.password[0]}</p>}
                            </div>
                            <div className="relative group space-y-1">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="h-11 pr-10 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl"
                                    placeholder="Confirm Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-[1.4rem] -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors z-20"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                                {errors?.confirmPassword && <p className="text-[10px] text-red-400 font-bold px-1">{errors.confirmPassword[0]}</p>}
                            </div>
                        </div>

                        <div className="px-1 pt-1">
                            <PasswordStrength
                                password={formData.password}
                                confirmPassword={formData.confirmPassword}
                                showMatch={true}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <div className="flex gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                            Please use your legal name as it appears on your government ID documents. This will be required for identity verification.
                        </p>
                    </div>

                    {errors?.message && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold tracking-tight">
                            {errors.message}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 group"
                >
                    <span className="flex items-center justify-center gap-2">
                        Create Account <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                </button>

                <div className="relative pt-2 text-center">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background/0 backdrop-blur-xl px-2 text-muted-foreground font-bold tracking-widest">
                            Already have an account?
                        </span>
                    </div>
                </div>

                <Link href="/login" className="block w-full">
                    <button type="button" className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-black uppercase tracking-[0.2em] text-xs transition-all duration-300">
                        Log In Now
                    </button>
                </Link>
            </form>
        </AuthLayout>
    );
}
