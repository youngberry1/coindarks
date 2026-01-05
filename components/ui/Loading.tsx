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
            "flex flex-col items-center justify-center relative",
            fullScreen ? "fixed inset-0 z-9999 bg-background/80 backdrop-blur-md" : "p-12 w-full min-h-[200px]",
            className
        )}>
            <div className="flex flex-col items-center gap-6">
                {/* Simple Premium Spinner */}
                <div className="relative w-12 h-12">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full rounded-full border-4 border-primary/20 border-t-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    />
                </div>

                {/* Loading Message */}
                {message && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-medium text-foreground/60 tracking-wide animate-pulse"
                    >
                        {message}
                    </motion.p>
                )}
            </div>
        </div>
    );
}
