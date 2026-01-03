"use client";

import { motion } from "framer-motion";
import { Shield, Zap, CircleDollarSign, Headphones } from "lucide-react";

const features = [
    {
        title: "Military-Grade Security",
        description: "Your assets are protected by advanced encryption and multi-sig cold storage. We prioritize your safety above all else.",
        icon: Shield,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        title: "Instant Transactions",
        description: "No more waiting for days. Our automated engine ensures crypto-to-fiat settlements happen in minutes.",
        icon: Zap,
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
    },
    {
        title: "Best Market Rates",
        description: "We provide the most competitive GHS and NGN rates in the market, with zero hidden fees.",
        icon: CircleDollarSign,
        color: "text-green-500",
        bg: "bg-green-500/10",
    },
    {
        title: "24/7 Priority Support",
        description: "Our dedicated team in Ghana and Nigeria is always available to help you via WhatsApp and Live Chat.",
        icon: Headphones,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
];

export default function Features() {
    return (
        <section id="how-it-works" className="py-24 bg-background relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[80px] rounded-full pointer-events-none -z-10 will-change-[filter]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 blur-[80px] rounded-full pointer-events-none -z-10 will-change-[filter]" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16 px-4">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl mb-4">
                        Built for the <span className="text-gradient">African Market</span>
                    </h2>
                    <p className="text-foreground/60 max-w-2xl mx-auto text-base sm:text-lg">
                        We&apos;ve tailored every feature to ensure a seamless experience for Ghanaian Cedi and Nigerian Naira users.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.1 }}
                            transition={{
                                duration: 0.5,
                                ease: "easeOut",
                                delay: index * 0.05,
                            }}
                            className="p-8 rounded-3xl border border-card-border bg-card-bg transition-shadow duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:bg-foreground/3 group will-change-transform transform-gpu"
                        >
                            <div className={`h-14 w-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                <feature.icon className={`h-7 w-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-sm text-foreground/60 leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
