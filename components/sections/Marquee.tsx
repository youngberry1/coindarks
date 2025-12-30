"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Smartphone } from "lucide-react";
import AirtelIcon from "@/public/assets/airtel.svg";
import MastercardIcon from "@/public/assets/mastercard.svg";
import VisaIcon from "@/public/assets/visa.svg";

const partners = [
    { name: "Bitcoin", icon: "btc", type: "crypto" },
    { name: "Ethereum", icon: "eth", type: "crypto" },
    { name: "Tether", icon: "usdt", type: "crypto" },
    { name: "Solana", icon: "sol", type: "crypto" },
    { name: "MTN MoMo", icon: "mtn", type: "payment", customIcon: "/assets/mtn.jpeg" },
    { name: "Telecel Cash", icon: "telecel", type: "payment", customIcon: "/assets/telecel.jpeg" },
    { name: "AirtelTigo", icon: "airtel", type: "payment", customIcon: AirtelIcon },
    { name: "Mastercard", icon: "mastercard", type: "payment", customIcon: MastercardIcon },
    { name: "Visa", icon: "visa", type: "payment", customIcon: VisaIcon },
    { name: "Binance Pay", icon: "bnb", type: "crypto" },
];

const PaymentIcon = ({ partner }: { partner: typeof partners[number] }) => {
    // If it's a custom image (JPEG/PNG/SVG)
    if (partner.customIcon) {
        return (
            <div className="relative h-8 w-12 opacity-60 dark:opacity-70 group-hover:opacity-100 transition-opacity">
                <Image
                    src={partner.customIcon}
                    alt={partner.name}
                    fill
                    sizes="48px"
                    className="object-contain"
                />
            </div>
        );
    }

    // Fallback to Lucide icon
    return (
        <div className="opacity-60 group-hover:opacity-100 transition-opacity">
            <Smartphone className="h-8 w-8 text-foreground/20 dark:text-white/30" />
        </div>
    );
};

export default function Marquee() {
    return (
        <div className="w-full bg-foreground/2 dark:bg-zinc-950 border-y border-foreground/5 dark:border-white/5 py-8 overflow-hidden relative">
            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-background pointer-events-none opacity-40" />

            <div className="flex whitespace-nowrap relative z-10">
                <motion.div
                    animate={{ x: [0, -1800] }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="flex gap-12 items-center px-8"
                >
                    {/* Double the list to create a seamless loop */}
                    {[...partners, ...partners].map((partner, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 group cursor-default"
                        >
                            {partner.type === "crypto" ? (
                                <div className="relative h-8 w-8 opacity-30 dark:opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Image
                                        src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color/${partner.icon}.svg`}
                                        alt={partner.name}
                                        fill
                                        sizes="32px"
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                            ) : (
                                <PaymentIcon partner={partner} />
                            )}
                            <span className="text-xl font-black text-foreground/15 dark:text-white/20 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                                {partner.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
