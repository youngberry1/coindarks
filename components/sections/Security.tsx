"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const securityFeatures = [
    {
        title: "AES-256 Encryption",
        description: "Bank-grade data protection standards.",
        icon: Lock,
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        title: "Cold Storage",
        description: "98% assets stored offline.",
        icon: ShieldCheck,
        color: "text-secondary",
        bg: "bg-secondary/10",
    },
];

export default function Security() {
    return (
        <section id="security" className="py-32 relative overflow-hidden">
            {/* Background Architecture */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[60px_60px] pointer-events-none" />
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse-slow" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">

                    {/* Visual & Context Column */}
                    <div className="space-y-12">
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

                    {/* Security Asset & Features */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative aspect-square sm:aspect-video lg:aspect-square rounded-[32px] overflow-hidden border border-white/5 bg-black/20 shadow-2xl group"
                        >
                            <Image
                                src="/security-professional.png"
                                alt="Institutional Grade Security"
                                fill
                                sizes="(max-width: 768px) 100vw, 600px"
                                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent opacity-60" />
                            <div className="absolute inset-0 ring-1 ring-white/10 rounded-[32px] pointer-events-none" />
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4">
                            {securityFeatures.slice(0, 2).map((feature) => (
                                <div key={feature.title} className="p-5 rounded-[24px] bg-white/2 border border-white/5 backdrop-blur-sm">
                                    <feature.icon className={cn("h-6 w-6 mb-3", feature.color)} />
                                    <h3 className="text-sm font-bold mb-1">{feature.title}</h3>
                                    <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
