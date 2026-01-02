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
import { Logo } from "@/components/ui/Logo";

export default function Home() {
  return (
    <main className="min-h-dvh bg-background selection:bg-primary/20">
      <Navbar />
      <Hero />
      <Marquee />
      <LiveMarket />
      <Features />
      <Security />
      <Testimonials />
      <TrustSection />

      <section id="cta" className="py-24 relative overflow-hidden bg-background">
        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10 will-change-[filter]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="relative rounded-[40px] overflow-hidden border border-card-border glass-morphism p-12 sm:p-20 text-center">
            {/* Inner background glow */}
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
              className="relative z-10"
            >
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-8">
                Ready to secure your <br className="hidden sm:block" />
                <span className="text-gradient">financial future?</span>
              </h2>
              <p className="text-foreground/60 max-w-xl mx-auto text-lg mb-12 font-medium">
                Join thousands of users in Ghana and Nigeria who trust CoinDarks for their daily crypto exchanges. Create your free account in seconds.
              </p>
              <Link href="/register">
                <button className="group relative rounded-full bg-primary px-12 py-5 font-bold text-white shadow-2xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/40 active:scale-95">
                  <span className="relative z-10">Create Free Account</span>
                  <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo variant="footer" />
          <p className="text-xs text-foreground/40 font-mono">
            © {new Date().getFullYear()} COINDARKS. SECURE CRYPTO BRIDGE.
          </p>
          <div className="flex gap-6 text-xs text-foreground/60">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Help</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
