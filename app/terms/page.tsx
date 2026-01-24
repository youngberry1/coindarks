"use client";

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, AlertCircle, RefreshCw, Zap, Gavel, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            <Navbar />

            <main className="pt-40 pb-32 relative overflow-hidden">
                {/* Atmosphere */}
                <div className="absolute inset-0 bg-mesh opacity-20 -z-10" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/5 blur-[160px] rounded-full -z-10 animate-pulse-slow" />

                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8 mb-24"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 group p-1 pr-4 rounded-full glass border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all"
                        >
                            <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                <ChevronLeft className="h-3 w-3" />
                            </div>
                            Return home
                        </Link>

                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                                Terms of <br />
                                <span className="text-gradient">Service.</span>
                            </h1>
                            <p className="text-xl text-foreground/50 font-medium max-w-2xl">
                                Rules and guidelines for using the CoinDarks platform to trade crypto and local currencies.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                            Update: January 2026
                        </div>
                    </motion.div>

                    {/* Content Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-12"
                    >
                        <section className="glass-card rounded-[48px] p-8 sm:p-14 border border-white/5 space-y-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Zap className="h-6 w-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight leading-none">1. How Trades Work</h2>
                            </div>
                            <div className="space-y-6 text-foreground/40 font-medium text-base leading-relaxed">
                                <p>
                                    CoinDarks provides a service for exchanging digital assets into
                                    local money (GHS and NGN). By using our service, you agree:
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Exchange rates change frequently based on market conditions.",
                                        "The rate shown when you confirm your order is final and will not change.",
                                        "Payments are final once processed by the banks or mobile money services."
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex gap-4">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <section className="p-8 sm:p-14 space-y-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <AlertCircle className="h-6 w-6 text-amber-500" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight leading-none">2. Your Responsibilities</h2>
                            </div>
                            <div className="space-y-6 text-foreground/40 font-medium text-base leading-relaxed">
                                <p>As a user of CoinDarks, you agree to:</p>
                                <ul className="space-y-4">
                                    {[
                                        "Providing accurate and truthful information during sign-up.",
                                        "Keeping your password and account security details safe.",
                                        "Using only funds that belong to you and are from legal sources.",
                                        "Following all laws and regulations regarding financial transactions."
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex gap-4">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-2.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <section className="glass-card rounded-[48px] p-8 sm:p-14 border border-white/5 space-y-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                                    <RefreshCw className="h-6 w-6 text-secondary" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight leading-none">3. Payments & Fees</h2>
                            </div>
                            <div className="space-y-6 text-foreground/40 font-medium text-base leading-relaxed">
                                <p>
                                    All fees are included in the exchange rate you see. There are no hidden or extra charges.
                                </p>
                                <p>
                                    Most trades are completed in minutes, but sometimes it might take longer due to network traffic or banking delays.
                                </p>
                            </div>
                        </section>

                        <section className="p-8 sm:p-14 space-y-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                    <Gavel className="h-6 w-6 text-red-500" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight leading-none">4. Our Responsibility</h2>
                            </div>
                            <p className="text-foreground/40 font-medium text-base leading-relaxed">
                                CoinDarks is not responsible for losses caused by market changes,
                                banking system failures, or errors in the wallet or bank details you provide.
                                Our maximum responsibility for any trade is limited to the value of that specific trade.
                            </p>
                        </section>

                        {/* Agreement Anchor */}
                        <div className="relative rounded-[60px] overflow-hidden bg-primary/5 p-12 sm:p-20 text-center border border-primary/10">
                            <div className="relative z-10 space-y-8">
                                <h3 className="text-3xl font-black tracking-tight">Acceptance.</h3>
                                <p className="text-foreground/40 font-medium max-w-lg mx-auto text-lg">
                                    Starting a trade means you agree to these Terms of Service and our Privacy Policy.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                    <Link href="/register" className="w-full sm:w-auto">
                                        <button className="w-full h-16 px-12 rounded-[24px] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95">
                                            Sign Up
                                        </button>
                                    </Link>
                                    <Link href="/help" className="w-full sm:w-auto">
                                        <button className="w-full h-16 px-12 rounded-[24px] glass border border-white/10 font-black text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-foreground/60">
                                            Contact Support
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
