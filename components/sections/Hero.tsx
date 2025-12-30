"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] hero-gradient pointer-events-none -z-10" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[80px] rounded-full pointer-events-none -z-10 will-change-[filter]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[80px] rounded-full pointer-events-none -z-10 will-change-[filter]" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">

                    {/* Left Column: Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 px-4 mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-medium text-foreground/80 uppercase tracking-wider">
                                Ghana & Nigeria&apos;s Trusted Bridge
                            </span>
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-7xl mb-6 leading-[1.1]">
                            Exchange Crypto to <br />
                            <span className="text-gradient">Fiat Instantly</span>
                        </h1>

                        <p className="max-w-xl text-base sm:text-lg text-foreground/60 leading-relaxed mb-10">
                            The most secure and reliable way to buy and sell Bitcoin, USDT, and more in Ghana and Nigeria. Professional-grade infrastructure with human-speed support.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/register" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto rounded-full bg-primary px-8 py-4 font-bold text-white transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2 active:scale-95">
                                    Start Trading Now <ArrowRight className="h-5 w-5" />
                                </button>
                            </Link>
                            <Link href="#market" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto rounded-full glass-morphism px-8 py-4 font-bold text-foreground transition-all hover:bg-foreground/5 active:scale-95 border border-foreground/5">
                                    View Live Rates
                                </button>
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-12 flex flex-wrap gap-8 opacity-60">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Secured by AES-256</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-secondary" />
                                <span className="text-sm font-medium">Instant Settlements</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-accent" />
                                <span className="text-sm font-medium">GHS / NGN Support</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Hero Image/Graphic */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="relative"
                    >
                        <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 shadow-2xl glass-morphism p-4 bg-foreground/2">
                            {/* Replace with actual image path after checking file system or using generated placeholder */}
                            <div className="relative w-full h-full bg-foreground/5 rounded-2xl flex items-center justify-center overflow-hidden">
                                <Image
                                    src="/hero-main.png"
                                    alt="Global Crypto Exchange"
                                    fill
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover animate-float"
                                />
                            </div>
                        </div>

                        {/* Floating Stats */}
                        <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-6 -left-6 rounded-2xl glass-morphism p-6 shadow-2xl border border-white/5 bg-nav-bg"
                        >
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Active Users</p>
                            <p className="text-xl sm:text-2xl font-bold">12,400+</p>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 6, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="absolute -top-6 -right-6 rounded-2xl glass-morphism p-6 shadow-2xl border border-white/5 bg-nav-bg"
                        >
                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Volume (24h)</p>
                            <p className="text-xl sm:text-2xl font-bold text-gradient">$1.2M+</p>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
