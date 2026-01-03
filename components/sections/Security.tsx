"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Fingerprint, ShieldAlert } from "lucide-react";

const securityFeatures = [
    {
        title: "End-to-End Encryption",
        description: "Your data and transactions are secured using bank-grade AES-256 encryption standards, ensuring privacy at every step.",
        icon: Lock,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        title: "Cold Storage Protection",
        description: "98% of digital assets are stored offline in multi-signature cold wallets, shielded from any online threats.",
        icon: ShieldCheck,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
    },
    {
        title: "Biometric Authentication",
        description: "Advanced identity verification including biometric-ready systems and multi-factor authentication (MFA).",
        icon: Fingerprint,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
    {
        title: "24/7 Fraud Monitoring",
        description: "Our AI-driven systems monitor suspicious activities around the clock to block unauthorized access instantly.",
        icon: ShieldAlert,
        color: "text-red-500",
        bg: "bg-red-500/10",
    }
];

export default function Security() {
    return (
        <section id="security" className="py-24 bg-background relative overflow-hidden border-t border-white/5">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    {/* Left content */}
                    <div className="lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: -12 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Uncompromising Safety
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                            className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-8 leading-tight"
                        >
                            Your Security is <br />
                            <span className="text-gradient">Our Top Priority</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                            className="text-foreground/60 text-lg mb-10 leading-relaxed max-w-lg"
                        >
                            We employ multiple layers of protection to ensure your funds and personal information remain safe. From advanced encryption to real-time threat detection, we&apos;ve got you covered.
                        </motion.p>

                        <div className="space-y-4 h-[108px] sm:h-auto">
                            {[
                                "Licensed & Regulated Standards",
                                "Regular External Security Audits",
                                "Real-time Transaction Shielding"
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -8 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                                    className="flex items-center gap-3 text-sm font-semibold"
                                >
                                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    </div>
                                    {item}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right grid */}
                    <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {securityFeatures.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.15 }}
                                transition={{
                                    duration: 0.5,
                                    ease: "easeOut",
                                    delay: index * 0.08
                                }}
                                className="p-8 rounded-4xl border border-card-border bg-card-bg/50 backdrop-blur-md hover:bg-foreground/3 transition-all group min-h-[180px]"
                            >
                                <div className={`h-12 w-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                </div>
                                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                                <p className="text-sm text-foreground/60 leading-relaxed">
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
