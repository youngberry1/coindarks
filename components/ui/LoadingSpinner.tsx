"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface LoadingSpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-20 h-20"
    };

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            {/* Outer Ring */}
            <motion.div
                className={cn(
                    "rounded-full border-[3px] border-primary/20 border-t-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]",
                    sizeClasses[size]
                )}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Inner Graphic */}
            <motion.div
                className={cn(
                    "absolute rounded-full bg-primary/10",
                    size === 'sm' ? "w-4 h-4" : size === 'md' ? "w-6 h-6" : size === 'lg' ? "w-8 h-8" : "w-10 h-10"
                )}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
}

export function PageLoading() {
    return (
        <div className="flex flex-1 min-h-[70vh] w-full flex-col items-center justify-center space-y-8 p-10">
            <LoadingSpinner size="xl" />
            <div className="space-y-2 text-center">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 animate-pulse"
                >
                    Synchronizing secure matrix...
                </motion.p>
                <div className="h-0.5 w-12 bg-primary/20 mx-auto rounded-full overflow-hidden">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="h-full w-full bg-primary shadow-[0_0_10px_#3b82f6]"
                    />
                </div>
            </div>
        </div>
    );
}

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
    className?: string;
}

export function Loading({
    message = "Synchronizing secure matrix...",
    fullScreen = true,
    className
}: LoadingProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (fullScreen) {
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = "unset";
            };
        }
    }, [fullScreen]);

    const content = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
                "flex flex-col items-center justify-center overflow-hidden",
                fullScreen ? "fixed inset-0 z-99999 bg-black/95 backdrop-blur-2xl h-screen w-screen" : "relative p-10 w-full min-h-[400px]",
                className
            )}
        >
            <div className="flex flex-col items-center gap-8 max-w-[90vw]">
                <LoadingSpinner size="xl" />

                {message && (
                    <div className="space-y-3 text-center">
                        <motion.p
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[10px] sm:text-xs font-black text-white/50 tracking-[0.4em] uppercase max-w-[280px] animate-pulse px-4 leading-relaxed italic"
                        >
                            {message}
                        </motion.p>
                        <div className="h-0.5 w-16 bg-white/10 mx-auto rounded-full overflow-hidden">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="h-full w-full bg-white shadow-[0_0_10px_#fff]"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Atmosphere Layer */}
            {fullScreen && (
                <>
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay grayscale invert dark:invert-0"
                        style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vh] h-[50vh] bg-primary/10 blur-[120px] rounded-full -z-10" />
                </>
            )}
        </motion.div>
    );

    if (!fullScreen) return content;
    if (!mounted) return null;

    return createPortal(content, document.body);
}
