"use client";

import Navbar from "@/components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Plus, Minus, HelpCircle, Shield, Wallet, MessageSquare } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { useState } from "react";

const faqCategories = [
    {
        id: "general",
        title: "General Questions",
        icon: HelpCircle,
        questions: [
            {
                q: "What is CoinDarks?",
                a: "CoinDarks is a professional crypto-to-fiat bridge specifically designed for the African market. We provide a secure platform for users in Ghana and Nigeria to exchange digital assets like Bitcoin and USDT for Cedis (GHS) and Naira (NGN) instantly."
            },
            {
                q: "How do I get started?",
                a: "Simply create a free account, complete a quick identity verification (KYC), and you're ready to trade. You can start with as little as $10."
            },
            {
                q: "Is CoinDarks available in my country?",
                a: "We currently provide full support for Ghana (Mobile Money & Bank) and Nigeria (Bank Transfers). We are working on expanding to more African regions soon."
            }
        ]
    },
    {
        id: "security",
        title: "Security & Trust",
        icon: Shield,
        questions: [
            {
                q: "Is my money safe?",
                a: "Yes. 98% of digital assets are kept in multi-sig cold storage. We use bank-grade AES-256 encryption for all data and employ automated fraud monitoring 24/7."
            },
            {
                q: "Why do I need to verify my identity?",
                a: "KYC (Know Your Customer) is a regulatory requirement that prevents fraud and money laundering. It helps us maintain a secure ecosystem for all legitimate traders."
            },
            {
                q: "What is the Escrow system?",
                a: "Our escrow system protects both buyers and sellers. When you initiate a trade, the assets are held securely by CoinDarks until the payment is confirmed, ensuring no one gets cheated."
            }
        ]
    },
    {
        id: "payments",
        title: "Payments & Rates",
        icon: Wallet,
        questions: [
            {
                q: "How fast are payouts?",
                a: "Most transactions are settled within 5-15 minutes. During peak hours or network congestion, it may take slightly longer, but our automated engine works around the clock."
            },
            {
                q: "What payment methods do you support?",
                a: "In Ghana, we support all major Mobile Money networks (MTN, Telecel, AT) and Bank Transfers. In Nigeria, we support all commercial banks and digital payment providers."
            },
            {
                q: "Are there any hidden fees?",
                a: "No. The rate you see at the point of confirmation is the exact rate you get. All processing fees and network costs are already included in that rate."
            }
        ]
    }
];

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/5 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group transition-all"
            >
                <span className={`text-lg font-bold tracking-tight transition-colors ${isOpen ? "text-primary" : "text-foreground/80 group-hover:text-foreground"}`}>
                    {question}
                </span>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${isOpen ? "bg-primary text-white rotate-180" : "bg-white/5 text-foreground/40 group-hover:bg-white/10"}`}>
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-foreground/60 leading-relaxed font-medium">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQPage() {
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
                        className="mb-16"
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
                                <HelpCircle className="h-6 w-6 text-primary" />
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight flex items-center gap-3">
                                Common <span className="text-gradient">Questions</span>
                            </h1>
                        </div>
                        <p className="text-foreground/60 font-medium text-lg">
                            Everything you need to know about using CoinDarks as your crypto bridge.
                        </p>
                    </motion.div>

                    {/* FAQ Grid */}
                    <div className="space-y-16">
                        {faqCategories.map((category, catIdx) => (
                            <motion.section
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * catIdx }}
                            >
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 rounded-xl bg-primary/5 border border-primary/10">
                                        <category.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight">{category.title}</h2>
                                </div>
                                <div className="rounded-[40px] border border-white/5 bg-white/5 backdrop-blur-md p-2 sm:p-8">
                                    <div className="divide-y divide-white/5 px-4 sm:px-0">
                                        {category.questions.map((item, idx) => (
                                            <FAQItem key={idx} question={item.q} answer={item.a} />
                                        ))}
                                    </div>
                                </div>
                            </motion.section>
                        ))}
                    </div>

                    {/* Contact CTA */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="mt-20 p-8 sm:p-12 rounded-[40px] border border-white/5 bg-primary/5 text-center"
                    >
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Still have questions?</h2>
                        <p className="text-foreground/60 font-medium mb-8 max-w-lg mx-auto">
                            Can&apos;t find what you&apos;re looking for? Our dedicated support team in Accra and Lagos is available 24/7 to assist you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/help">
                                <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
                                    Support Center
                                </button>
                            </Link>
                            <Link href="/dashboard/support">
                                <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-foreground font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                                    Open Live Chat
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </>
    );
}
