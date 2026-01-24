"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
    showLogo?: boolean;
}

export function AuthLayout({ children, title, subtitle, showLogo = true }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-background">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-40 pointer-events-none" />

            {/* Ambient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] pointer-events-none animate-pulse-slow delay-1000" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[480px] relative z-10"
            >
                {/* Glass Card */}
                <div className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden">
                    <div className="p-6 sm:p-10">
                        {/* Header */}
                        <div className="text-center mb-8 space-y-4">
                            {showLogo && (
                                <div className="flex justify-center mb-6">
                                    <Logo className="scale-110" />
                                </div>
                            )}
                            <div className="space-y-2">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{title}</h1>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{subtitle}</p>
                            </div>
                        </div>

                        {/* Content */}
                        {children}
                    </div>
                </div>

                {/* Footer safe area for aesthetics */}
                <div className="h-4" />
            </motion.div>
        </div>
    );
}
