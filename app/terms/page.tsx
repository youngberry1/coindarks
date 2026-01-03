"use client";

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Scale, AlertCircle, RefreshCw, Zap, Gavel } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
    return (
        <>
            <header>
                <Navbar />
            </header>

            <main className="pt-32 pb-24 bg-background">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors mb-8"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Home
                        </Link>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Scale className="h-6 w-6 text-primary" />
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Terms of <span className="text-gradient">Service</span></h1>
                        </div>
                        <p className="text-foreground/60 font-medium text-lg">
                            Please read these terms carefully before using the CoinDarks platform.
                        </p>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-invert prose-primary max-w-none space-y-12"
                    >
                        <section className="p-8 rounded-[40px] border border-white/5 bg-white/5 backdrop-blur-md">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <Zap className="h-5 w-5 text-primary" />
                                1. The Exchange Service
                            </h2>
                            <div className="space-y-4 text-foreground/70 leading-relaxed font-medium">
                                <p>
                                    CoinDarks provides a platform for exchanging cryptocurrencies for fiat currency (GHS and NGN) and vice versa. By using our service, you acknowledge that:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Exchange rates are dynamic and may change rapidly due to market volatility.</li>
                                    <li>The rate confirmed at the time of your order is the final rate applied to your transaction.</li>
                                    <li>Transactions are final once processed and cannot be reversed.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-primary" />
                                2. User Obligations
                            </h2>
                            <div className="space-y-4 text-foreground/70 leading-relaxed font-medium">
                                <p>As a user of CoinDarks, you agree to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Provide accurate and complete information during registration and KYC verification.</li>
                                    <li>Maintain the security of your account credentials and multi-factor authentication.</li>
                                    <li>Only use funds that you are legally authorized to transact with.</li>
                                    <li>Not use the platform for any illegal activities, including money laundering or terrorism financing.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="p-8 rounded-[40px] border border-white/5 bg-white/5 backdrop-blur-md">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <RefreshCw className="h-5 w-5 text-primary" />
                                3. Fees & Processing Times
                            </h2>
                            <div className="space-y-4 text-foreground/70 leading-relaxed font-medium">
                                <p>
                                    Processing fees are included in the exchange rate shown at checkout. There are no hidden charges.
                                </p>
                                <p>
                                    While we aim for instant transactions, processing times may vary based on blockchain network congestion and third-party payment provider availability (MoMo, Banking networks).
                                </p>
                            </div>
                        </section>

                        <section className="p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <Gavel className="h-5 w-5 text-primary" />
                                4. Limitation of Liability
                            </h2>
                            <p className="text-foreground/70 leading-relaxed font-medium">
                                CoinDarks shall not be liable for any losses resulting from market volatility, blockchain errors, user-provided incorrect wallet addresses, or localized banking system failures. Our liability is limited to the value of the specific transaction in dispute.
                            </p>
                        </section>

                        <section className="p-8 rounded-[40px] border border-white/5 bg-primary/5">
                            <h2 className="text-xl font-bold mb-4">Acceptance of Terms</h2>
                            <p className="text-foreground/60 font-medium mb-6">
                                By creating an account or initiating a transaction on CoinDarks, you signify your agreement to these Terms of Service and our Privacy Policy.
                            </p>
                            <div className="flex gap-4">
                                <Link href="/register">
                                    <button className="px-8 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                                        Get Started
                                    </button>
                                </Link>
                                <Link href="/help">
                                    <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-foreground font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                                        Ask Questions
                                    </button>
                                </Link>
                            </div>
                        </section>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </>
    );
}
