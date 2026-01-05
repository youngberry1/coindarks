"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
    className?: string;
}

export function Loading({
    message = "Loading...",
    fullScreen = true,
    className
}: LoadingProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center relative overflow-hidden",
            fullScreen ? "fixed inset-0 z-9999 bg-background/80 backdrop-blur-md h-dvh w-screen" : "p-4 sm:p-8 md:p-12 w-full min-h-[200px]",
            className
        )}>
            <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 max-w-[90vw]">
                {/* Responsive High-End Spinner */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full rounded-full border-[3px] sm:border-4 border-primary/10 border-t-primary shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                    />
                    {/* Inner pulse for extra depth */}
                    <motion.div
                        animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-primary/5 -z-10"
                    />
                </div>

                {/* Loading Message - Responsive Typography */}
                {message && (
                    <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs sm:text-sm md:text-base font-bold text-foreground/50 tracking-widest uppercase text-center max-w-xs sm:max-w-sm md:max-w-md animate-pulse px-4"
                    >
                        {message}
                    </motion.p>
                )}
            </div>

            {/* Subtle background noise for premium feel without complexity */}
            {fullScreen && (
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay grayscale invert dark:invert-0"
                    style={{ backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")` }} />
            )}
        </div>
    );
}
