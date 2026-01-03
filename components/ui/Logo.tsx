"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
    variant?: "default" | "compact" | "footer";
    className?: string;
}

// Shared icon component for consistency - Declared outside to avoid React warnings
const LogoIcon = ({ size = 40 }: { size: number }) => (
    <div
        className="relative flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 rounded-full overflow-hidden bg-white shadow-sm border border-white/10"
        style={{ width: size, height: size }}
    >
        <div className="relative w-full h-full scale-[1.6]">
            <Image
                src="/logo-icon.png"
                alt="CoinDarks"
                fill
                className="object-contain"
                sizes={`${size}px`}
                priority
            />
        </div>
    </div>
);

export function Logo({ variant = "default", className = "" }: LogoProps) {
    // Footer variant (small, simple)
    if (variant === "footer") {
        return (
            <Link href="/" className={`flex items-center gap-2 ${className}`} aria-label="CoinDarks Home">
                <LogoIcon size={24} />
                <span className="font-bold opacity-80 uppercase tracking-widest text-sm" aria-hidden="true">
                    CoinDarks Exchange
                </span>
            </Link>
        );
    }

    // Compact variant (icon only, for mobile or tight spaces)
    if (variant === "compact") {
        return (
            <Link href="/" className={`group ${className}`} aria-label="CoinDarks Home">
                <LogoIcon size={40} />
            </Link>
        );
    }

    // Default variant (full logo with text)
    return (
        <Link href="/" className={`group flex items-center gap-3 ${className}`} aria-label="CoinDarks Home">
            <LogoIcon size={40} />
            <span className="text-2xl font-bold tracking-tight hidden sm:block">
                Coin<span className="text-primary group-hover:text-primary-dark transition-colors">Darks</span>
            </span>
        </Link>
    );
}
