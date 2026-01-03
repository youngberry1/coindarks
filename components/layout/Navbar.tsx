"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, LayoutDashboard, LogOut, Shield, Zap, Globe, ArrowRight, Star, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: "Exchange", href: "/#home", icon: Zap },
        { name: "Live Market", href: "/#market", icon: Globe },
        { name: "Features", href: "/#how-it-works", icon: ShieldCheck },
        { name: "Security", href: "/#security", icon: Shield },
        { name: "Testimonials", href: "/#testimonials", icon: Star },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 mt-2">
            <nav className="mx-auto max-w-7xl rounded-4xl border bg-black/60 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] py-3 px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Logo />

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-2xl p-1 border border-white/5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-5 py-2 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all flex items-center gap-2"
                            >
                                <link.icon className="h-4 w-4 opacity-70" />
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:block">
                            <ThemeToggle />
                        </div>
                        {session ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/dashboard"
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
                                    className="hidden sm:block text-sm font-bold px-5 py-2.5 hover:text-primary transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="hidden sm:flex relative group overflow-hidden px-6 py-2.5 rounded-xl bg-primary font-bold text-white text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Get Started <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Trigger */}
                        <div className="md:hidden">
                            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                                <SheetTrigger asChild>
                                    <button
                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-foreground transition-all active:scale-90"
                                        aria-label="Open navigation menu"
                                    >
                                        <Menu className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l border-white/10 bg-background/95 backdrop-blur-3xl p-0 flex flex-col h-dvh">
                                    <div className="p-3 border-b border-white/5 shrink-0">
                                        <Logo className="text-left" />
                                        <VisuallyHidden>
                                            <SheetTitle>Navigation Menu</SheetTitle>
                                        </VisuallyHidden>
                                    </div>

                                    <ScrollArea className="flex-1">
                                        <div className="p-4 pb-10 flex flex-col gap-4">
                                            <div className="flex items-center justify-between px-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Menu Navigation</span>
                                                <ThemeToggle />
                                            </div>

                                            <div className="grid grid-cols-1 gap-2">
                                                {navLinks.map((link) => (
                                                    <Link
                                                        key={link.name}
                                                        href={link.href}
                                                        onClick={(e) => {
                                                            const id = link.href.split("#")[1];
                                                            if (id) {
                                                                const element = document.getElementById(id);
                                                                if (element) {
                                                                    e.preventDefault();
                                                                    element.scrollIntoView({ behavior: "smooth" });
                                                                }
                                                            }
                                                            setIsOpen(false);
                                                        }}
                                                        className="flex items-center gap-4 p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary/10 hover:border-primary/20 transition-all group"
                                                    >
                                                        <div className="h-8 w-8 rounded-xl bg-background flex items-center justify-center shrink-0 border border-white/5">
                                                            <link.icon className="h-3.5 w-3.5 text-foreground/40 group-hover:text-primary transition-colors" />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{link.name}</span>
                                                    </Link>
                                                ))}

                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-4 p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-secondary/10 hover:border-secondary/20 transition-all group"
                                                >
                                                    <div className="h-8 w-8 rounded-xl bg-background flex items-center justify-center shrink-0 border border-white/5">
                                                        <LayoutDashboard className="h-3.5 w-3.5 text-foreground/40 group-hover:text-secondary transition-colors" />
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Dashboard</span>
                                                </Link>
                                            </div>

                                            <div className="h-px bg-white/5 mx-2" />

                                            <div className="flex flex-col gap-2">
                                                {!session ? (
                                                    <>
                                                        <Link
                                                            href="/login"
                                                            onClick={() => setIsOpen(false)}
                                                            className="w-full py-2.5 rounded-2xl bg-white/5 border border-white/5 text-center text-[11px] font-bold hover:bg-white/10 transition-all uppercase tracking-widest"
                                                        >
                                                            Login to Account
                                                        </Link>
                                                        <Link
                                                            href="/register"
                                                            onClick={() => setIsOpen(false)}
                                                            className="w-full py-2.5 rounded-2xl bg-primary text-center font-bold text-white text-[11px] shadow-xl shadow-primary/20 flex items-center justify-center gap-2 uppercase tracking-widest group"
                                                        >
                                                            Get Started
                                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            signOut();
                                                            setIsOpen(false);
                                                        }}
                                                        className="w-full py-2.5 rounded-2xl bg-red-500/10 text-red-500 text-[11px] font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        Sign Out
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
