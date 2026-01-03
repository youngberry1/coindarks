"use client";

import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    const links = [
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
        { name: "Help", href: "/help" },
    ];

    return (
        <footer className="py-12 border-t border-white/5 bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <Logo variant="footer" />
                <div className="flex flex-col items-center md:items-end gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                    <p>© {currentYear} COINDARKS. SECURE CRYPTO BRIDGE.</p>
                    <p className="flex items-center gap-1.5">
                        Build <span className="text-primary/40 text-[8px]">●</span>
                        Developed by <span className="text-foreground/60 transition-colors hover:text-primary cursor-default">Abdul Barcky Arimiyao</span>
                        <span className="text-primary/40 text-[8px]">●</span>
                        <span className="text-foreground/60 transition-colors hover:text-primary cursor-default">The TBX Team</span>
                    </p>
                </div>
                <div className="flex gap-6 text-xs text-foreground/60">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`transition-colors ${pathname === link.href ? 'text-primary font-bold' : 'hover:text-primary'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}
