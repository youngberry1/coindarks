"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Zap, Globe, Sparkles } from "lucide-react";
import { useCallback } from "react";

export default function Hero() {
    const router = useRouter();
    const pathname = usePathname();

    const handlePrefetch = useCallback((href: string) => {
        if (href.startsWith('/') && !href.includes('#') && href !== pathname) {
            router.prefetch(href);
        }
    }, [pathname, router]);
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center pt-32 sm:pt-40 lg:pt-48 pb-12 sm:pb-24 lg:pb-32 overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 bg-mesh opacity-40 -z-10" />
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -z-10 animate-pulse-slow" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/15 blur-[120px] rounded-full -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }} />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col items-center text-center space-y-12">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)] group cursor-default"
                    >
                        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
                            The New Standard for Web3 in Africa
                        </span>
                    </motion.div>

                    {/* Main Content */}
                    <div className="max-w-4xl space-y-8">
                        <motion.h1
                            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] overflow-visible"
                        >
                            The Cleanest Way <br />
                            To <span className="text-gradient">Bridge Value.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="max-w-2xl mx-auto text-lg sm:text-xl text-foreground/60 leading-relaxed font-medium"
                        >
                            CoinDarks is a professional-grade exchange platform serving Ghana and Nigeria.
                            Experience institutional liquidity with humanized support and instant settlements.
                        </motion.p>
                    </div>

                    {/* Action Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-xl justify-center"
                    >
                        <Link
                            href="/register"
                            onMouseEnter={() => handlePrefetch("/register")}
                            className="w-full sm:w-auto"
                        >
                            <button className="w-full px-12 py-5 sm:py-6 rounded-[20px] sm:rounded-[24px] bg-primary text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 active:scale-95 group">
                                Start Trading <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <Link href="#market" className="w-full sm:w-auto">
                            <button className="w-full px-12 py-6 rounded-[24px] glass border border-white/10 font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95">
                                Live Rates
                            </button>
                        </Link>
                    </motion.div>

                    {/* Visual Asset Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="relative w-full max-w-5xl mt-12 group"
                    >
                        <div className="relative aspect-video lg:aspect-21/9 rounded-[24px] overflow-hidden border border-white/5 bg-black/40 shadow-2xl shadow-primary/5">
                            <div className="relative w-full h-full overflow-hidden">
                                <Image
                                    src="/hero-professional-branded.png"
                                    alt="CoinDarks Pro Interface"
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                                    className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-40" />
                                <div className="absolute inset-0 ring-1 ring-white/10 rounded-[24px] pointer-events-none" />
                            </div>
                        </div>

                        {/* Floating Status Indicators */}
                        <div className="absolute -top-6 -left-6 hidden md:block">
                            <div className="glass p-5 rounded-[24px] border-primary/20 animate-bounce-subtle">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Settlement</p>
                                        <p className="font-black text-sm">Instant Release</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -bottom-6 -right-6 hidden md:block">
                            <div className="glass p-5 rounded-[24px] border-secondary/20 animate-bounce-subtle" style={{ animationDelay: '1s' }}>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                                        <ShieldCheck className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Trust Score</p>
                                        <p className="font-black text-sm">99.9% Secured</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="pt-20 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full max-w-4xl px-4"
                    >
                        <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl glass border border-white/5 bg-white/2 hover:bg-white/5 hover:border-primary/20 transition-all duration-500 group/trust">
                            <Globe className="h-4 w-4 text-primary/60 group-hover/trust:text-primary transition-colors" />
                            <span className="font-bold text-[11px] uppercase tracking-[0.15em] text-foreground/50 group-hover/trust:text-foreground transition-colors whitespace-nowrap">GHS / NGN Pairs</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl glass border border-white/5 bg-white/2 hover:bg-white/5 hover:border-emerald-500/20 transition-all duration-500 group/trust">
                            <ShieldCheck className="h-4 w-4 text-emerald-500/60 group-hover/trust:text-emerald-500 transition-colors" />
                            <span className="font-bold text-[11px] uppercase tracking-[0.15em] text-foreground/50 group-hover/trust:text-foreground transition-colors whitespace-nowrap">256-bit Encryption</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl glass border border-white/5 bg-white/2 hover:bg-white/5 hover:border-amber-500/20 transition-all duration-500 group/trust">
                            <Zap className="h-4 w-4 text-amber-500/60 group-hover/trust:text-amber-500 transition-colors" />
                            <span className="font-bold text-[11px] uppercase tracking-[0.15em] text-foreground/50 group-hover/trust:text-foreground transition-colors whitespace-nowrap">High Performance</span>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
