"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CryptoIconProps {
    symbol: string;
    iconUrl?: string | null;
    className?: string;
}

export function CryptoIcon({ symbol, iconUrl, className }: CryptoIconProps) {
    const [hasError, setHasError] = useState(false);

    const cdnUrl = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${symbol.toLowerCase()}.svg`;
    const src = iconUrl?.startsWith('http') ? iconUrl : cdnUrl;

    if (hasError) {
        return (
            <div className={cn(
                "h-full w-full rounded-full flex items-center justify-center bg-white/5 border border-white/5 font-black text-primary uppercase select-none",
                className
            )}>
                {symbol[0]}
            </div>
        );
    }

    return (
        <div className={cn("relative h-full w-full overflow-hidden rounded-full", className)}>
            <Image
                src={src}
                alt={symbol}
                fill
                className="object-cover"
                onError={() => setHasError(true)}
            />
        </div>
    );
}
