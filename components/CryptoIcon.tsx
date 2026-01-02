"use client";

import Image from "next/image";
import { useState } from "react";

interface CryptoIconProps {
    symbol: string;
    iconUrl?: string | null;
    className?: string;
}

export function CryptoIcon({ symbol, iconUrl, className }: CryptoIconProps) {
    const [hasError, setHasError] = useState(false);

    const cdnUrl = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${symbol.toLowerCase()}.svg`;
    const src = iconUrl?.startsWith('http') ? iconUrl : cdnUrl;

    if (hasError) return null;

    return (
        <Image
            src={src}
            alt={symbol}
            fill
            className={className}
            onError={() => setHasError(true)}
        />
    );
}
