"use client";

import Link from "next/link";

interface LogoProps {
    variant?: "default" | "compact" | "footer";
    className?: string;
}

export function Logo({ variant = "default", className = "" }: LogoProps) {
    // Footer variant (small, simple)
    if (variant === "footer") {
        return (
            <Link href="/" className={`flex items-center gap-2 ${className}`}>
                <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                    CD
                </div>
                <span className="font-bold opacity-80 uppercase tracking-widest text-sm">
                    CoinDarks Exchange
                </span>
            </Link>
        );
    }

    // Compact variant (icon only, for mobile or tight spaces)
    if (variant === "compact") {
        return (
            <Link href="/" className={`group ${className}`}>
                <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-primary flex items-center justify-center font-bold text-white text-xl transition-transform group-hover:scale-110 group-active:scale-95 shadow-lg shadow-primary/20">
                    CD
                    <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </Link>
        );
    }

    // Default variant (full logo with text)
    return (
        <Link href="/" className={`group flex items-center gap-2 ${className}`}>
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-primary flex items-center justify-center font-bold text-white text-xl transition-transform group-hover:scale-110 group-active:scale-95 shadow-lg shadow-primary/20">
                CD
                <div className="absolute inset-0 bg-linear-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-2xl font-bold tracking-tight hidden sm:block">
                Coin<span className="text-primary group-hover:text-primary-dark transition-colors">Darks</span>
            </span>
        </Link>
    );
}
