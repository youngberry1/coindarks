"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Lock } from "lucide-react";

export default function TrustSection() {
    return (
        <section className="py-24 relative overflow-hidden bg-background">
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 -z-10 will-change-[filter]" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Image Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.98 }}
                        whileInView={{ opacity: 1, x: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{
                            type: "spring",
                            stiffness: 80,
                            damping: 25,
                        }}
                        className="relative order-2 lg:order-1 will-change-transform"
                    >
                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-card-border glass-morphism p-2 bg-foreground/2">
                            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-foreground/5">
                                <Image
                                    src="/hero_graphic_1.png"
                                    alt="Secure Network"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-10 -right-10 h-40 w-40 bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />
                        <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-secondary/10 blur-[100px] rounded-full pointer-events-none -z-10" />
                    </motion.div>

                    {/* Content Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.98 }}
                        whileInView={{ opacity: 1, x: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{
                            type: "spring",
                            stiffness: 80,
                            damping: 25,
                            delay: 0.05,
                        }}
                        className="space-y-10 order-1 lg:order-2 px-4 sm:px-0 will-change-transform"
                    >
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl mb-6 leading-tight">
                                Why Thousands in <span className="text-gradient">Ghana & Nigeria</span> Trust Us
                            </h2>
                            <p className="text-foreground/60 leading-relaxed text-base sm:text-lg font-medium">
                                We provide a professional bridge between your digital assets and local currency. Our platform is built on transparency, speed, and uncompromising security.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex flex-col sm:flex-row gap-6 group">
                                <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                                    <Lock className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg mb-2">Non-Custodial Focus</h4>
                                    <p className="text-sm text-foreground/60 leading-relaxed font-medium">
                                        We don&apos;t hold your funds longer than necessary. Exchange and withdraw instantly to your local bank account or mobile money wallet.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 group">
                                <div className="h-12 w-12 shrink-0 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg mb-2">Local Compliance</h4>
                                    <p className="text-sm text-foreground/60 leading-relaxed font-medium">
                                        Fully compliant with local regulations in both Ghana and Nigeria, providing you with a legal, safe, and regulated exchange environment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
