"use client";

import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

export function Footer() {
    const pathname = usePathname();
    const router = useRouter();
    const currentYear = new Date().getFullYear();

    const handlePrefetch = useCallback((href: string) => {
        if (href.startsWith('/') && !href.includes('#') && href !== pathname) {
            router.prefetch(href);
        }
    }, [pathname, router]);

    const links = [
        { name: "FAQ", href: "/faq" },
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
        { name: "Help", href: "/help" },
    ];

    return (
        <footer className="py-20 relative overflow-hidden border-t border-white/5">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 lg:gap-20">
                    <div className="space-y-6 max-w-xs">
                        <Logo variant="footer" />
                        <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                            Professional cryptocurrency infrastructure bridging the gap for the African digital economy.
                            Secure, institutional liquidity.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-12 sm:gap-24">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Ecosystem</h4>
                            <div className="flex flex-col gap-4">
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onMouseEnter={() => handlePrefetch(link.href)}
                                        className={cn(
                                            "text-xs font-black uppercase tracking-widest transition-all hover:text-primary hover:translate-x-1 duration-300",
                                            pathname === link.href ? 'text-primary' : 'text-foreground/80'
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Verification</h4>
                            <div className="flex flex-col gap-4 text-xs font-black uppercase tracking-widest text-foreground/80">
                                <span>Ghana SEC Verified</span>
                                <span>CBN Compliant NG</span>
                                <span>ISO 27001 Stds</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/60">
                            © {currentYear} COINDARKS. CRYPTO INFRASTRUCTURE.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-foreground/60">
                        <span>Developed by <span className="text-foreground/80 font-black">Abdul Barcky Arimiyao</span></span>
                        <div className="h-1 w-1 rounded-full bg-primary/30" />
                        <span>TBX Technical Team</span>
                    </div>
                </div>
            </div>

            {/* Subtle background glow */}
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -z-10" />
        </footer>
    );
}
