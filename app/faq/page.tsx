"use client";

import Navbar from "@/components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Plus, Minus, HelpCircle, Shield, MessageSquare, Sparkles } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { useState } from "react";
import { cn } from "@/lib/utils";

const faqCategories = [
    {
        id: "general",
        title: "About CoinDarks",
        icon: HelpCircle,
        questions: [
            {
                q: "What is CoinDarks?",
                a: "CoinDarks is a secure and easy-to-use platform for trading cryptocurrency and local currencies in Africa. We provide reliable exchange services for Ghana and Nigeria, allowing you to instantly convert your digital assets into local money and vice versa."
            },
            {
                q: "How do I create an account?",
                a: "Simply sign up with your email address, complete your account verification (KYC), and you'll be ready to start trading immediately."
            },
            {
                q: "Which countries are supported?",
                a: "We currently support Ghana (GHS) and Nigeria (NGN). You can use all major banks and mobile money services within these countries to complete your trades."
            }
        ]
    },
    {
        id: "security",
        title: "Security & Safety",
        icon: Shield,
        questions: [
            {
                q: "How is my crypto secured?",
                a: "The vast majority of digital assets are stored in secure, offline vaults. All your data is protected with bank-grade encryption, and our systems are monitored around the clock to keep your account safe."
            },
            {
                q: "Why do I need to verify my identity?",
                a: "Identity verification (KYC) is required to keep our platform safe and comply with financial regulations. This helps prevent fraud and ensures a secure trading environment for everyone."
            },
            {
                q: "Does CoinDarks use Escrow?",
                a: "Yes, we use a secure escrow system. During a trade, funds are held safely and only released when payment is confirmed. This protects both buyers and sellers from any risk."
            }
        ]
    }
];

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/5 last:border-0 group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-8 flex items-center justify-between text-left transition-all"
            >
                <span className={cn(
                    "text-lg font-black tracking-tight transition-all duration-300",
                    isOpen ? "text-primary translate-x-1" : "text-foreground/60 group-hover:text-foreground"
                )}>
                    {question}
                </span>
                <div className={cn(
                    "h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                    isOpen ? "bg-primary text-white rotate-180 shadow-lg shadow-primary/20" : "bg-white/5 text-foreground/40 group-hover:bg-white/10"
                )}>
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="pb-8 text-foreground/40 leading-relaxed font-medium text-base max-w-3xl">
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
        <div className="min-h-screen bg-background selection:bg-primary/20">
            <Navbar />

            <main className="pt-40 pb-32 relative overflow-hidden">
                {/* Atmosphere */}
                <div className="absolute inset-0 bg-mesh opacity-20 -z-10" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full -z-10 animate-pulse-slow" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 blur-[140px] rounded-full -z-10 animate-pulse-slow" />

                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
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
                                Knowledge <br />
                                <span className="text-gradient">Base.</span>
                            </h1>
                            <p className="text-xl text-foreground/50 font-medium max-w-2xl">
                                Learn more about how CoinDarks works and how to keep your account secure.
                            </p>
                        </div>
                    </motion.div>

                    {/* FAQ Categories */}
                    <div className="space-y-12">
                        {faqCategories.map((category, catIdx) => (
                            <motion.section
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * catIdx }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-4 px-4">
                                    <category.icon className="h-5 w-5 text-primary" />
                                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/30">{category.title}</h2>
                                </div>
                                <div className="glass-card rounded-[48px] p-2 sm:p-12 border border-white/5">
                                    <div className="divide-y divide-white/5 px-6 sm:px-0">
                                        {category.questions.map((item, idx) => (
                                            <FAQItem key={idx} question={item.q} answer={item.a} />
                                        ))}
                                    </div>
                                </div>
                            </motion.section>
                        ))}
                    </div>

                    {/* Support Anchor */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="mt-32 relative rounded-[60px] overflow-hidden glass-card p-12 sm:p-20 text-center border border-white/10 group"
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />
                        <div className="relative z-10 space-y-8">
                            <div className="h-20 w-20 rounded-[32px] bg-primary/10 flex items-center justify-center mx-auto border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                                <MessageSquare className="h-10 w-10 text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl sm:text-4xl font-black tracking-tight">Need help?</h3>
                                <p className="text-foreground/40 font-medium max-w-lg mx-auto text-lg leading-relaxed">
                                    Our support teams in Accra and Lagos are available 24/7 to help you with any questions.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link href="/help" className="w-full sm:w-auto">
                                    <button className="w-full h-16 px-12 rounded-[24px] bg-primary text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95">
                                        Help Center
                                    </button>
                                </Link>
                                <Link href="/dashboard/support" className="w-full sm:w-auto">
                                    <button className="w-full h-16 px-12 rounded-[24px] glass border border-white/10 font-black text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-foreground/60">
                                        Contact Support <Sparkles className="ml-2 h-3 w-3 inline" />
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
