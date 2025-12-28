"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, LayoutDashboard, User, LogOut, Shield, Zap, Globe, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

import { Logo } from "@/components/ui/Logo";

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Exchange", href: "#", icon: Zap },
        { name: "Rates", href: "#rates", icon: Globe },
        { name: "Security", href: "#security", icon: Shield },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 lg:px-8 py-4 ${scrolled ? "mt-2" : "mt-0"
                }`}
        >
            <div className={`mx-auto max-w-7xl transition-all duration-500 rounded-4xl border ${scrolled
                ? "bg-black/60 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] py-3 px-6"
                : "bg-transparent border-transparent py-4 px-2"
                }`}>
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Logo />

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-2xl p-1 border border-white/5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-5 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all flex items-center gap-2"
                            >
                                <link.icon className="h-4 w-4 opacity-50" />
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
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
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
                                    className="relative group overflow-hidden px-6 py-2.5 rounded-xl bg-primary font-bold text-white text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Get Started <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-foreground transition-all active:scale-90"
                        >
                            <AnimatePresence mode="wait">
                                {isOpen ? (
                                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                                        <X className="h-6 w-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                                        <Menu className="h-6 w-6" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-background/60 backdrop-blur-md z-[-1]"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="absolute top-24 left-4 right-4 z-40 md:hidden"
                        >
                            <div className="glass-morphism rounded-[2.5rem] border border-white/10 p-6 shadow-2xl bg-nav-bg">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-xs font-black uppercase tracking-widest opacity-40">Menu</span>
                                        <ThemeToggle />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {navLinks.map((link, idx) => (
                                            <motion.div
                                                key={link.name}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                            >
                                                <Link
                                                    href={link.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-primary/10 hover:border-primary/20 transition-all group"
                                                >
                                                    <link.icon className="h-6 w-6 text-foreground/40 group-hover:text-primary transition-colors" />
                                                    <span className="text-xs font-bold uppercase tracking-widest">{link.name}</span>
                                                </Link>
                                            </motion.div>
                                        ))}
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                                            <Link
                                                href="/dashboard"
                                                onClick={() => setIsOpen(false)}
                                                className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-secondary/10 hover:border-secondary/20 transition-all group"
                                            >
                                                <User className="h-6 w-6 text-foreground/40 group-hover:text-secondary transition-colors" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Profile</span>
                                            </Link>
                                        </motion.div>
                                    </div>

                                    <hr className="border-white/5" />

                                    <div className="flex flex-col gap-3">
                                        {!session ? (
                                            <>
                                                <Link
                                                    href="/login"
                                                    onClick={() => setIsOpen(false)}
                                                    className="w-full py-4 rounded-2xl bg-white/5 text-center font-bold hover:bg-white/10 transition-all"
                                                >
                                                    Login to Account
                                                </Link>
                                                <Link
                                                    href="/register"
                                                    onClick={() => setIsOpen(false)}
                                                    className="w-full py-4 rounded-2xl bg-primary text-center font-bold text-white shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                                >
                                                    Create Account <ChevronRight className="h-5 w-5" />
                                                </Link>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    signOut();
                                                    setIsOpen(false);
                                                }}
                                                className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 font-bold border border-red-500/20"
                                            >
                                                Sign Out
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
