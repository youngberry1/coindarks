"use client";

import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
    className?: string;
}

export function Loading({
    message = "Processing secure transaction...",
    fullScreen = true,
    className
}: LoadingProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center relative overflow-hidden",
            fullScreen ? "fixed inset-0 z-100 bg-background/80 backdrop-blur-2xl" : "p-12 w-full h-full",
            className
        )}>
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)] blur-[120px] opacity-10"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay" />
            </div>

            <div className="relative flex flex-col items-center gap-12 max-w-md w-full px-6">
                {/* The Mind-Blowing Core Loader */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Outer Rotating Ring - Large */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-dashed border-primary/20"
                    />

                    {/* Middle Hexagon Ring - Cyber Style */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 rounded-[40px] border-2 border-primary/10 flex items-center justify-center"
                    >
                        <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full animate-pulse-slow" />
                    </motion.div>

                    {/* Floating Geometric Shards */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                rotate: [0, 360],
                                x: [0, Math.cos(i * 60 * Math.PI / 180) * 80, 0],
                                y: [0, Math.sin(i * 60 * Math.PI / 180) * 80, 0],
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{
                                duration: 4 + i,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.2
                            }}
                            className="absolute w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_var(--color-primary)]"
                        />
                    ))}

                    {/* The Logo Core */}
                    <motion.div
                        animate={{
                            scale: [0.95, 1.05, 0.95],
                            boxShadow: [
                                "0 0 20px rgba(59, 130, 246, 0.2)",
                                "0 0 50px rgba(59, 130, 246, 0.4)",
                                "0 0 20px rgba(59, 130, 246, 0.2)"
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="z-10 bg-background/50 backdrop-blur-md rounded-2xl p-4 border border-white/10"
                    >
                        <Logo variant="compact" className="scale-125" />
                    </motion.div>

                    {/* Orbital Particle System */}
                    <div className="absolute inset-0 animate-spin-slow">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-secondary blur-sm opacity-50 shadow-[0_0_20px_var(--color-secondary)]" />
                    </div>
                </div>

                {/* Message and Progress */}
                <div className="flex flex-col items-center gap-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h3 className="text-xl md:text-2xl font-black italic tracking-tighter bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {message}
                        </h3>
                        <div className="flex items-center justify-center gap-1.5 h-1">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        backgroundColor: ["#3b82f6", "#8b5cf6", "#3b82f6"],
                                        height: ["4px", "8px", "4px"],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.15,
                                        ease: "easeInOut"
                                    }}
                                    className="w-12 h-1 rounded-full"
                                />
                            ))}
                        </div>
                    </motion.div>

                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">
                        Secure Digital Infrastructure
                    </p>
                </div>
            </div>

            {/* Cyber Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        </div>
    );
}

// Add these to globals.css if not present, but for now using inline utilities or framer
// .animate-spin-slow { animation: spin 8s linear infinite; }
