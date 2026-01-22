"use client";

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            <Navbar />

            <main className="pt-40 pb-32 relative overflow-hidden">
                {/* Atmosphere */}
                <div className="absolute inset-0 bg-mesh opacity-20 -z-10" />
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[160px] rounded-full -z-10 animate-pulse-slow" />

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
                            <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none">
                                Privacy <br />
                                <span className="text-gradient">Policy.</span>
                            </h1>
                            <p className="text-xl text-foreground/50 font-medium max-w-2xl">
                                Transparency on how we handle your data, protect your account, and comply with regional regulations.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            Version 2.4.0 • Updated January 2026
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
                                    <Eye className="h-6 w-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight leading-none">1. Data Collection</h2>
                            </div>
                            <div className="space-y-6 text-foreground/40 font-medium text-base leading-relaxed">
                                <p>
                                    To provide secure crypto-to-fiat trades in Ghana and Nigeria,
                                    we collect specific details to verify and manage your account:
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Personal Details (Your full name, email address, and phone number).",
                                        "Official Identity (ID documents used for account verification).",
                                        "Trade Information (Wallet addresses and details of your trades).",
                                        "Security Data (IP address and device info used to prevent fraud)."
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
                                <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                                    <Lock className="h-6 w-6 text-secondary" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight leading-none">2. How we use your data</h2>
                            </div>
                            <div className="space-y-6 text-foreground/40 font-medium text-base leading-relaxed">
                                <p>We use your information to provide our services and keep the platform safe:</p>
                                <ul className="space-y-4">
                                    {[
                                        "Processing your trades and payments safely.",
                                        "Meeting financial regulations and anti-fraud requirements.",
                                        "Protecting your account from hacking and unauthorized access.",
                                        "Sending you important updates about your account and our services."
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex gap-4">
                                            <div className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0 mt-2.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <section className="glass-card rounded-[48px] p-8 sm:p-14 border border-white/5 space-y-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <FileText className="h-6 w-6 text-emerald-500" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight leading-none">3. Data Security</h2>
                            </div>
                            <div className="space-y-6 text-foreground/40 font-medium text-base leading-relaxed">
                                <p>
                                    We maintain a high level of security, using advanced encryption and secure systems to protect your data.
                                </p>
                                <p>
                                    Data retention is strictly followed based on regional financial regulations in
                                    Ghana and Nigeria, ensuring data remains active only as long as needed for transaction history.
                                </p>
                            </div>
                        </section>

                        {/* Audit Anchor */}
                        <div className="relative rounded-[60px] overflow-hidden bg-primary/5 p-12 sm:p-20 text-center border border-primary/10">
                            <div className="relative z-10 space-y-8">
                                <h3 className="text-3xl font-black tracking-tight">Questions about Privacy?</h3>
                                <p className="text-foreground/40 font-medium max-w-lg mx-auto text-lg">
                                    Our compliance teams in Accra and Lagos are available to answer any questions about your data and privacy.
                                </p>
                                <Link href="/help" className="inline-block">
                                    <button className="h-16 px-12 rounded-[24px] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95">
                                        Contact Support
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
