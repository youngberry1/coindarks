"use client";

import { motion } from "framer-motion";
import { GraduationCap, Search } from "lucide-react";

export function AcademyHero() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 -left-20 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full -z-10" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-primary/20"
                    >
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">
                            Knowledge is Liquidity
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-4xl font-black tracking-tight leading-[0.95]"
                    >
                        The CoinDarks <br />
                        <span className="text-gradient">Academy.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-foreground/60 font-medium leading-relaxed"
                    >
                        Expert-led guides on cryptocurrency security, market dynamics, and regional
                        bridging protocols. Elevate your trading intelligence.
                    </motion.p>

                    {/* Simple Search Simulation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full max-w-md relative group mt-8"
                    >
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for guides, safety protocols..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-white/8 transition-all"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
