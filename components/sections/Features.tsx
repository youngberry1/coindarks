"use client";

import { motion } from "framer-motion";
import { Shield, Zap, CircleDollarSign, Headphones, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        title: "Enterprise Security",
        description: "Your assets are guarded by physical cold storage and AES-256 bank-level encryption. Your safety is our obsession.",
        icon: Shield,
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        title: "Quantum Settlements",
        description: "Experience the speed of light. Our automated engine processes GHS and NGN payouts in under 5 minutes.",
        icon: Zap,
        color: "text-secondary",
        bg: "bg-secondary/10",
    },
    {
        title: "Zero Spread Pricing",
        description: "Transparent, real-time rates with no hidden fees or aggressive spreads. What you see is exactly what you get.",
        icon: CircleDollarSign,
        color: "text-accent",
        bg: "bg-accent/10",
    },
    {
        title: "Diamond Support",
        description: "Expert assistance available 24/7. Connect instantly via WhatsApp or our integrated priority ticketing system.",
        icon: Headphones,
        color: "text-primary",
        bg: "bg-primary/10",
    },
];

export default function Features() {
    return (
        <section id="how-it-works" className="py-32 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full -z-10 animate-pulse-slow" style={{ animationDelay: '3s' }} />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col items-center text-center space-y-6 mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="px-4 py-1.5 rounded-full glass border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40"
                    >
                        Regional Infrastructure
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-2xl sm:text-3xl font-black tracking-tight"
                    >
                        Built for the <br className="sm:hidden" />
                        <span className="text-gradient">African Market</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl text-lg text-foreground/60 font-medium"
                    >
                        We&apos;ve engineered a bespoke experience tailored for the specific liquidity and operational
                        needs of Ghana and Nigeria. Seamless, secure, and purely professional.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative p-10 rounded-[40px] glass-card hover:border-primary/20 transition-all duration-500 hover-lift"
                        >
                            <div className={cn(
                                "h-16 w-16 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                                feature.bg
                            )}>
                                <feature.icon className={cn("h-8 w-8", feature.color)} />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-black tracking-tight">{feature.title}</h3>
                                <p className="text-sm text-foreground/50 leading-relaxed font-medium">
                                    {feature.description}
                                </p>
                            </div>

                            <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                                <CheckCircle2 className="h-3 w-3" />
                                Fully Verified
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
