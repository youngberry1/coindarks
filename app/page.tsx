"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import LiveMarket from "@/components/sections/LiveMarket";
import Features from "@/components/sections/Features";
import Security from "@/components/sections/Security";
import TrustSection from "@/components/sections/TrustSection";
import Testimonials from "@/components/sections/Testimonials";
import Link from "next/link";
import { motion } from "framer-motion";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main className="bg-background selection:bg-primary/20">
        <Hero />
        <Marquee />
        <LiveMarket />
        <Features />
        <Security />
        <Testimonials />
        <TrustSection />

        <section id="cta" className="py-32 relative overflow-hidden">
          {/* Ambient Foundation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-primary/10 blur-[140px] rounded-full -z-10 animate-pulse-slow" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="relative rounded-[60px] overflow-hidden border border-white/10 glass-card p-12 sm:p-24 text-center group">
              {/* Internal Atmosphere */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 opacity-50 pointer-events-none" />
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/20 blur-[80px] rounded-full group-hover:scale-125 transition-transform duration-1000" />

              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 space-y-10"
              >
                <div className="space-y-6">
                  <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-[0.95]">
                    Ready to bridge your <br />
                    <span className="text-gradient">Financial Future?</span>
                  </h2>
                  <p className="text-foreground/50 max-w-2xl mx-auto text-lg sm:text-xl font-medium leading-relaxed">
                    Join thousands of elite traders in Ghana and Nigeria who have upgraded to our
                    institutional-grade bridge. Professional settlements, starting in seconds.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href="/register" className="w-full sm:w-auto">
                    <button className="w-full px-12 py-6 rounded-[24px] bg-primary text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 hover:shadow-primary/50 transition-all active:scale-95">
                      Start Trading
                    </button>
                  </Link>
                  <Link href="/faq" className="w-full sm:w-auto">
                    <button className="w-full px-12 py-6 rounded-[24px] glass border border-white/10 font-black text-sm uppercase tracking-[0.2em] hover:bg-white/5 transition-all">
                      Read Documentation
                    </button>
                  </Link>
                </div>

                <div className="pt-8 flex flex-wrap justify-center gap-8 grayscale opacity-30">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase">No Hidden Fees</span>
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase">Instant KYB/KYC</span>
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase">24/7 Liquidity</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
