"use client";

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Shield, Lock, Eye, FileText } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
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
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Privacy <span className="text-gradient">Policy</span></h1>
                        </div>
                        <p className="text-foreground/60 font-medium text-lg">
                            Last Updated: January 2026. Your privacy is our priority at CoinDarks.
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
                                <Eye className="h-5 w-5 text-primary" />
                                1. Information We Collect
                            </h2>
                            <div className="space-y-4 text-foreground/70 leading-relaxed font-medium">
                                <p>
                                    To provide our secure crypto-fiat exchange services in Ghana and Nigeria, we collect information that identifies you (&quot;Personal Information&quot;). This includes:
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Full name, email address, and phone number.</li>
                                    <li>Government-issued identification (for KYC/AML compliance).</li>
                                    <li>Transaction history and wallet addresses.</li>
                                    <li>Device information and IP addresses for security and fraud prevention.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <Lock className="h-5 w-5 text-primary" />
                                2. How We Use Your Data
                            </h2>
                            <div className="space-y-4 text-foreground/70 leading-relaxed font-medium">
                                <p>We process your information for the following purposes:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>To facilitate and process your crypto-to-fiat transactions.</li>
                                    <li>To comply with regulatory Anti-Money Laundering (AML) and Know Your Customer (KYC) requirements.</li>
                                    <li>To protect your account from unauthorized access and fraudulent activity.</li>
                                    <li>To provide customer support and send important system updates.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="p-8 rounded-[40px] border border-white/5 bg-white/5 backdrop-blur-md">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <FileText className="h-5 w-5 text-primary" />
                                3. Data Retention & Security
                            </h2>
                            <div className="space-y-4 text-foreground/70 leading-relaxed font-medium">
                                <p>
                                    We implement industry-standard security measures, including end-to-end encryption and multi-factor authentication, to safeguard your data.
                                </p>
                                <p>
                                    Your data is retained only for as long as necessary to fulfill the purposes outlined in this policy or as required by financial regulations in our operating regions.
                                </p>
                            </div>
                        </section>

                        <section className="p-8">
                            <h2 className="text-xl font-bold mb-6">4. Third-Party Disclosures</h2>
                            <p className="text-foreground/70 leading-relaxed font-medium">
                                We do not sell your personal data. We may share information with trusted partners (e.g., identity verification services and payment processors) solely to provide our services. We may also disclose information to law enforcement where required by applicable laws in Ghana or Nigeria.
                            </p>
                        </section>

                        <section className="p-8 rounded-[40px] border border-white/5 bg-primary/5">
                            <h2 className="text-xl font-bold mb-4">Contact Us</h2>
                            <p className="text-foreground/60 font-medium mb-6">
                                If you have any questions about this Privacy Policy or how we handle your data, please reach out to our privacy team.
                            </p>
                            <Link href="/help">
                                <button className="px-8 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                                    Contact Support
                                </button>
                            </Link>
                        </section>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </>
    );
}
