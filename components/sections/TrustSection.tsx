"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Globe, ArrowUpRight } from "lucide-react";

export default function TrustSection() {
    return (
        <section className="py-32 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full -z-10" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 xl:gap-24 items-center">

                    {/* Visual Showcase Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="lg:col-span-5 relative group"
                    >
                        <div className="relative aspect-square rounded-[32px] overflow-hidden border border-white/5 bg-black/20 shadow-2xl">
                            <div className="relative w-full h-full overflow-hidden">
                                <Image
                                    src="/trust-professional.png"
                                    alt="Global Finance Connection"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 600px"
                                    className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent opacity-60" />
                                <div className="absolute inset-0 ring-1 ring-white/10 rounded-[32px] pointer-events-none" />
                            </div>
                        </div>

                        {/* Floating Interaction Element */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-10 right-0 lg:-right-10 glass p-8 rounded-[32px] border border-white/10 shadow-2xl max-w-[240px]"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <Globe className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-black tracking-tight mb-1">Local Payouts</p>
                            <p className="text-xs text-foreground/50 font-medium">Bank-direct settlements across Ghana & Nigeria.</p>
                        </motion.div>
                    </motion.div>

                    {/* Content Narrative Column */}
                    <div className="lg:col-span-7 space-y-12">
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/20 bg-secondary/5 text-secondary text-[10px] font-black uppercase tracking-[0.3em]"
                            >
                                Built for Confidence
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] max-w-lg lg:max-w-none"
                            >
                                Why the <span className="text-gradient">Continent&apos;s best</span> trust CoinDarks.
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-lg sm:text-xl text-foreground/60 font-medium max-w-2xl"
                            >
                                We provide more than just an exchange; we deliver a professional pipeline between
                                global digital liquidity and local fiat economy.
                            </motion.p>
                        </div>

                        <div className="space-y-10">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="flex gap-8 group"
                            >
                                <div className="h-14 w-14 shrink-0 rounded-2xl glass border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                                    <Lock className="h-7 w-7" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        Non-Custodial Ethos <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                    </h4>
                                    <p className="text-sm text-foreground/50 leading-relaxed font-medium">
                                        We respect the sovereignty of your assets. Our engine executes trades instantly,
                                        settling directly to your local accounts without unnecessary holding periods.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="flex gap-8 group"
                            >
                                <div className="h-14 w-14 shrink-0 rounded-2xl glass border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shadow-sm">
                                    <ShieldCheck className="h-7 w-7" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black tracking-tight flex items-center gap-2">
                                        Regulatory Rigor <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                    </h4>
                                    <p className="text-sm text-foreground/50 leading-relaxed font-medium">
                                        Operating in full alignment with Ghanaian and Nigerian financial standards.
                                        We provide a legal, transparent, and fully audit-ready exchange framework.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
