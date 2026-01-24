"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, LayoutDashboard, LogOut, Shield, Zap, Globe, ArrowRight, Star, ShieldCheck, GraduationCap } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState, useMemo, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";


export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolledSection, setScrolledSection] = useState("");

    const currentActive = useMemo(() => {
        return pathname === "/" ? scrolledSection : pathname;
    }, [pathname, scrolledSection]);

    const navLinks = useMemo(() => [
        { name: "Buy & Sell", href: "/#home", icon: Zap },
        { name: "Price Tracker", href: "/#market", icon: Globe },
        { name: "Features", href: "/#how-it-works", icon: ShieldCheck },
        { name: "Security", href: "/#security", icon: Shield },
        { name: "Testimonials", href: "/#testimonials", icon: Star },
        { name: "Academy", href: "/academy", icon: GraduationCap },
    ], []);

    // Active section detection for homepage
    useEffect(() => {
        if (pathname !== "/") return;

        const handleScroll = () => {
            const sections = navLinks.map(link => link.href.split("#")[1]).filter(Boolean);
            let current = "";
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150) current = `/#${section}`;
                }
            }
            if (scrolledSection !== current) {
                setScrolledSection(current);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [pathname, navLinks, scrolledSection]);

    const handlePrefetch = useCallback((href: string) => {
        const route = href.split("#")[0];
        if (route && route !== pathname) {
            router.prefetch(route);
        }
    }, [pathname, router]);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 mt-2">
            <nav className="mx-auto max-w-7xl rounded-4xl border bg-black/60 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] py-3 px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Logo />

                    {/* Desktop Nav Links */}
                    <div className="hidden xl:flex items-center gap-1 bg-white/5 rounded-2xl p-1 border border-white/5 relative">
                        {navLinks.map((link) => {
                            const isActive = currentActive === link.href;

                            // Check if we can do a client-side scroll
                            const isScrollLink = link.href.startsWith("/#");

                            const handleClick = (e: React.MouseEvent) => {
                                if (pathname === "/" && isScrollLink) {
                                    const id = link.href.split("#")[1];
                                    const element = document.getElementById(id);
                                    if (element) {
                                        e.preventDefault();
                                        element.scrollIntoView({ behavior: "smooth" });
                                        // Update URL hash without reload
                                        window.history.pushState(null, "", `/#${id}`);
                                    }
                                }
                            };

                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={handleClick}
                                    onMouseEnter={() => handlePrefetch(link.href)}
                                    className={`relative px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 group ${isActive ? "text-white" : "text-foreground/60 hover:text-foreground"
                                        }`}
                                >
                                    <link.icon className={`h-4 w-4 transition-colors ${isActive ? "text-primary" : "opacity-70 group-hover:opacity-100"}`} />
                                    <span className="relative z-10">{link.name}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl z-0"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center gap-3">
                        {status === "loading" ? (
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="h-10 w-24 bg-white/5 rounded-xl animate-pulse" />
                                <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse" />
                            </div>
                        ) : session ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/dashboard"
                                    onMouseEnter={() => handlePrefetch("/dashboard")}
                                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                    title="Sign Out"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    onMouseEnter={() => handlePrefetch("/login")}
                                    className="hidden sm:block text-sm font-bold px-5 py-2.5 hover:text-primary transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    onMouseEnter={() => handlePrefetch("/register")}
                                    className="hidden sm:flex relative group overflow-hidden px-6 py-2.5 rounded-xl bg-primary font-bold text-white text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Start Trading <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Trigger */}
                        <div className="xl:hidden">
                            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                                <SheetTrigger asChild>
                                    <button
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-foreground transition-all active:scale-90"
                                        aria-label="Open navigation menu"
                                    >
                                        <Menu className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-full sm:w-[400px] border-l border-white/10 bg-black/95 backdrop-blur-3xl p-0 flex flex-col h-dvh">
                                    {/* Header */}
                                    <div className="p-6 border-b border-white/5 shrink-0 flex items-center justify-between">
                                        <Logo className="text-left scale-110" />
                                        <VisuallyHidden>
                                            <SheetTitle>Mobile Navigation</SheetTitle>
                                            <SheetDescription>Main navigation menu</SheetDescription>
                                        </VisuallyHidden>
                                    </div>

                                    {/* Main Navigation */}
                                    <ScrollArea className="flex-1">
                                        <div className="p-6 flex flex-col gap-2">
                                            <div className="flex flex-col gap-1">
                                                {navLinks.map((link) => (
                                                    <Link
                                                        key={link.name}
                                                        href={link.href}
                                                        onMouseEnter={() => handlePrefetch(link.href)}
                                                        onClick={(e) => {
                                                            setIsOpen(false); // Close immediately for better perceived speed

                                                            // Handle scroll if on homepage and it's a hash link
                                                            if (pathname === "/" && link.href.startsWith("/#")) {
                                                                const id = link.href.split("#")[1];
                                                                if (id) {
                                                                    const element = document.getElementById(id);
                                                                    if (element) {
                                                                        e.preventDefault();
                                                                        // Small timeout to allow sheet to start closing
                                                                        setTimeout(() => {
                                                                            element.scrollIntoView({ behavior: "smooth" });
                                                                            window.history.pushState(null, "", `/#${id}`);
                                                                        }, 100);
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                        className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all"
                                                    >
                                                        <span className="text-lg font-bold tracking-tight text-foreground/80 group-hover:text-primary transition-colors">{link.name}</span>
                                                        <link.icon className="h-5 w-5 text-foreground/20 group-hover:text-primary transition-colors" />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </ScrollArea>

                                    {/* Footer Actions */}
                                    <div className="p-4 border-t border-white/5 bg-white/2 shrink-0 space-y-3">
                                        {status === "loading" ? (
                                            <>
                                                <div className="w-full h-14 bg-white/5 rounded-2xl animate-pulse" />
                                                <div className="w-full h-10 bg-white/5 rounded-2xl animate-pulse" />
                                            </>
                                        ) : !session ? (
                                            <>
                                                <Link
                                                    href="/register"
                                                    onClick={() => setIsOpen(false)}
                                                    className="w-full py-4 rounded-2xl bg-primary text-center font-bold text-white text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 transition-all"
                                                >
                                                    Start Trading
                                                    <ArrowRight className="h-5 w-5" />
                                                </Link>
                                            </>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setIsOpen(false)}
                                                    className="col-span-2 py-4 rounded-2xl bg-primary text-center font-bold text-white text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 transition-all"
                                                >
                                                    <LayoutDashboard className="h-5 w-5" />
                                                    Dashboard
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        signOut();
                                                        setIsOpen(false);
                                                    }}
                                                    className="col-span-2 py-3.5 rounded-2xl bg-red-500/10 text-red-500 text-sm font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
