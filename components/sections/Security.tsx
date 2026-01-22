"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Fingerprint, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const securityFeatures = [
    {
        title: "End-to-End Encryption",
        description: "Your data and transactions are secured using bank-grade AES-256 standards, ensuring privacy at every touchpoint.",
        icon: Lock,
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        title: "Cold Storage Protocol",
        description: "98% of digital assets are stored offline in multi-signature cold wallets, shielded from any and all online threats.",
        icon: ShieldCheck,
        color: "text-secondary",
        bg: "bg-secondary/10",
    },
    {
        title: "Biometric Integration",
        description: "Advanced identity verification including biometric-ready ecosystems and hardware-level multi-factor authentication.",
        icon: Fingerprint,
        color: "text-accent",
        bg: "bg-accent/10",
    },
    {
        title: "Proactive Guard",
        description: "Our AI-driven systems monitor suspicious activities around the clock to block unauthorized access in real-time.",
        icon: ShieldAlert,
        color: "text-primary",
        bg: "bg-primary/10",
    }
];

export default function Security() {
    return (
        <section id="security" className="py-32 relative overflow-hidden">
            {/* Background Architecture */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[60px_60px] pointer-events-none" />
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse-slow" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-20 items-center">

                    {/* Visual & Context Column */}
                    <div className="lg:w-1/2 space-y-12">
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Institutional Grade Defense
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]"
                            >
                                Your Security is <br />
                                <span className="text-gradient">Our Foundation.</span>
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-foreground/60 text-lg sm:text-xl font-medium max-w-xl"
                            >
                                We employ multi-layered security protocols engineered to protect both institutional
                                and individual participants in the African digital economy.
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                            {[
                                "Licensed & Fully Regulated",
                                "Continuous Security Audits",
                                "Real-time Payload Encryption",
                                "Hardware-backed Verification"
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    </div>
                                    <span className="text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Feature Matrix */}
                    <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                        {/* Decorative Connection Lines */}
                        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 -z-10 rounded-[40px]" />

                        {securityFeatures.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-10 rounded-[40px] glass-card border border-white/5 hover:border-primary/20 transition-all duration-500 hover-lift flex flex-col items-center text-center sm:text-left sm:items-start group"
                            >
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 shadow-sm",
                                    feature.bg
                                )}>
                                    <feature.icon className={cn("h-7 w-7", feature.color)} />
                                </div>
                                <h3 className="text-lg font-black tracking-tight mb-3">{feature.title}</h3>
                                <p className="text-sm text-foreground/50 leading-relaxed font-medium">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
