"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface LoadingSpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16"
    };

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            {/* Outer Ring */}
            <motion.div
                className={cn(
                    "rounded-full border-2 border-primary/20 border-t-primary",
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
                    size === 'sm' ? "w-4 h-4" : size === 'md' ? "w-6 h-6" : "w-8 h-8"
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
        <div className="flex h-full w-full flex-col items-center justify-center min-h-[50vh] space-y-4">
            <LoadingSpinner size="lg" />
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                vocab="0.5"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 animate-pulse"
            >
                Loading Content...
            </motion.p>
        </div>
    );
}

export function Loading({ message }: { message?: string }) {
    useEffect(() => {
        // Prevent scrolling when loading overlay is active
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-9999 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                {message && (
                    <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30"
                    >
                        {message}
                    </motion.p>
                )}
            </div>
        </div>
    );
}
