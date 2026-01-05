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
            fullScreen ? "fixed inset-0 z-9999 bg-background/95 backdrop-blur-3xl" : "p-12 w-full min-h-[400px] rounded-[40px] bg-background/40 border border-white/5 shadow-2xl overflow-hidden",
            className
        )}>
            {/* --- Premium Background System --- */}
            <div className="absolute inset-0 pointer-events-none scale-110">
                {/* Adaptive Mesh Gradient */}
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] opacity-[0.08] dark:opacity-[0.12]"
                    style={{
                        background: `radial-gradient(circle at center, var(--color-primary) 0%, var(--color-secondary) 30%, transparent 70%)`,
                        filter: "blur(120px)",
                    }}
                />

                {/* Secondary Ripple Layer */}
                <motion.div
                    animate={{
                        rotate: [360, 0],
                        scale: [1.2, 1, 1.2],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[20%] w-[130%] h-[130%] opacity-[0.05] dark:opacity-[0.08]"
                    style={{
                        background: `radial-gradient(circle at center, var(--color-accent) 0%, var(--color-primary) 40%, transparent 60%)`,
                        filter: "blur(100px)",
                    }}
                />

                {/* Cyber Noise Texture */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] grayscale brightness-150 contrast-150 mix-blend-overlay"
                    style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }}
                />

                {/* Animated Scanline Effect */}
                <motion.div
                    animate={{ y: ["-100%", "100%"] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-linear-to-b from-transparent via-primary/5 to-transparent h-1/4 w-full opacity-20"
                />
            </div>

            <div className="relative flex flex-col items-center gap-16 max-w-lg w-full px-8 z-10">
                {/* --- The Quantum Core Loader --- */}
                <div className="relative w-64 h-64 flex items-center justify-center">

                    {/* Inner Quantum Orb */}
                    <motion.div
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.5, 0.8, 0.5],
                            boxShadow: [
                                "0 0 20px var(--color-primary)",
                                "0 0 60px var(--color-primary)",
                                "0 0 20px var(--color-primary)"
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-32 h-32 rounded-full bg-linear-to-tr from-primary/20 to-secondary/20 backdrop-blur-xl border border-white/10"
                    />

                    {/* Concentric Rotating Rings */}
                    {[80, 110, 140].map((radius, i) => (
                        <motion.div
                            key={i}
                            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                            transition={{
                                duration: 10 + i * 5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute rounded-full border border-dashed border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                            style={{ width: radius * 2, height: radius * 2 }}
                        />
                    ))}

                    {/* Orbital Particles (Nanolights) */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.3, 1],
                            }}
                            transition={{
                                duration: 6 + i,
                                repeat: Infinity,
                                ease: "linear",
                                delay: i * 0.4
                            }}
                            className="absolute h-full w-0.5"
                            style={{ transform: `rotate(${i * 45}deg)` }}
                        >
                            <motion.div
                                animate={{
                                    y: [-30, 30, -30],
                                    opacity: [0.3, 1, 0.3],
                                    boxShadow: [
                                        "0 0 10px var(--color-primary)",
                                        "0 0 20px var(--color-secondary)",
                                        "0 0 10px var(--color-primary)"
                                    ]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-1.5 h-1.5 rounded-full bg-white"
                            />
                        </motion.div>
                    ))}

                    {/* The Logo Core */}
                    <div className="z-50 flex items-center justify-center">
                        <motion.div
                            animate={{
                                y: [-5, 5, -5],
                                rotateZ: [-2, 2, -2]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Logo variant="compact" className="scale-150 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]" />
                        </motion.div>
                    </div>

                    {/* Pulsing Light Rays */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <div className="w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent blur-xl animate-pulse" />
                        <div className="w-1 h-full bg-linear-to-b from-transparent via-secondary to-transparent blur-xl animate-pulse" />
                    </div>
                </div>

                {/* --- Message and Dynamic Feedback --- */}
                <div className="flex flex-col items-center gap-8 text-center">
                    <div className="space-y-4">
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-3xl font-black tracking-tight"
                        >
                            <span className="bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent bg-size-[200%_auto] animate-gradient-x italic">
                                {message}
                            </span>
                        </motion.h3>

                        {/* Premium Progress Bar (Infinity Style) */}
                        <div className="relative w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
                            <motion.div
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 w-1/2 bg-linear-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_0_15px_var(--color-primary)]"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 items-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/30 animate-pulse">
                            Quantum Encrypted Session
                        </p>
                        {/* Decorative Icons */}
                        <div className="flex gap-2 opacity-20">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-1 h-1 rounded-full bg-foreground" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Geometric Distortion Grid --- */}
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(var(--color-primary) 0.5px, transparent 0.5px)`,
                    backgroundSize: '32px 32px'
                }}
            />
        </div>
    );
}
