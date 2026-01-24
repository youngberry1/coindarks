"use client";

import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { Twitter, Send, Linkedin } from "lucide-react";

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
        { name: "Academy", href: "/academy" },
    ];

    const socialLinks = [
        { name: "Twitter", href: "#", icon: Twitter },
        { name: "Telegram", href: "#", icon: Send },
        { name: "LinkedIn", href: "#", icon: Linkedin },
    ];

    return (
        <footer className="py-20 relative overflow-hidden border-t border-white/5 bg-black/20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    {/* Brand Section */}
                    <div className="space-y-8 flex flex-col items-center md:items-start text-center md:text-left col-span-1 md:col-span-2 lg:col-span-1">
                        <Logo variant="footer" />
                        <p className="max-w-xs text-sm text-foreground/70 font-medium leading-relaxed">
                            Professional cryptocurrency infrastructure bridging the gap for the African digital economy.
                            Secure, institutional liquidity.
                        </p>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.name}
                                    href={social.href}
                                    className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 active:scale-95"
                                    aria-label={social.name}
                                >
                                    <social.icon className="h-4.5 w-4.5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="flex flex-wrap md:col-span-2 lg:col-span-3 justify-center md:justify-around lg:justify-end gap-12 sm:gap-24">
                        <div className="space-y-6 text-center md:text-left">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Ecosystem</h4>
                            <div className="flex flex-col gap-4">
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onMouseEnter={() => handlePrefetch(link.href)}
                                        className={cn(
                                            "text-xs font-bold uppercase tracking-widest transition-all hover:text-primary hover:translate-x-1 duration-300",
                                            pathname === link.href ? 'text-primary' : 'text-foreground/70'
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6 text-center md:text-left">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Verification</h4>
                            <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-foreground/70">
                                <span className="hover:text-foreground transition-colors cursor-default">Ghana SEC Verified</span>
                                <span className="hover:text-foreground transition-colors cursor-default">CBN Compliant NG</span>
                                <span className="hover:text-foreground transition-colors cursor-default">ISO 27001 Stds</span>
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

            {/* Subtle background glows */}
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -z-10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full -z-10" />
        </footer>
    );
}
