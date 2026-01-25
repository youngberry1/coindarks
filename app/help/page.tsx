"use client";

import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    ChevronLeft,
    Mail,
    Phone,
    MessageSquare,
    Clock,
    ExternalLink,
    Globe
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function HelpPage() {
    const locations = [
        {
            country: "Ghana",
            city: "Accra",
            address: "Digital Support Office",
            phone: "+233 55 968 4347",
            email: "ghana@coindarks.com",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15883.56561214!2d-0.20!3d5.55!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzMnMDAuMCJOIDDCsDEyJzAwLjAiVw!5e0!3m2!1sen!2sgh!4v1625000000000!5m2!1sen!2sgh"
        },
        {
            country: "Regional Expansion",
            city: "West Africa Hub",
            address: "Building the future of African Web3",
            phone: "Digital Support Only",
            email: "support@coindarks.com",
            isComingSoon: true
        }
    ];

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            <Navbar />

            <main className="pt-40 pb-32 relative overflow-hidden">
                {/* Atmosphere */}
                <div className="absolute inset-0 bg-mesh opacity-20 -z-10" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full -z-10 animate-pulse-slow" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 blur-[140px] rounded-full -z-10 animate-pulse-slow" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-8 mb-24"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 group p-1 pr-4 rounded-full glass border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all"
                        >
                            <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                <ChevronLeft className="h-3 w-3" />
                            </div>
                            Return home
                        </Link>

                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                                Support <span className="text-gradient">Center.</span>
                            </h1>
                            <p className="text-xl text-foreground/50 font-medium max-w-2xl mx-auto">
                                Reliable support for your CoinDarks account. Reach our core support team
                                in Accra for immediate assistance.
                            </p>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
                        {/* Contact Quick Cards */}
                        <div className="group glass-card p-10 rounded-[48px] text-center space-y-8 border border-white/5 hover-lift">
                            <div className="h-20 w-20 rounded-[32px] bg-primary/10 flex items-center justify-center mx-auto border border-primary/20 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-primary/10">
                                <Mail className="h-10 w-10 text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black tracking-tight">Email Support</h3>
                                <p className="text-sm text-foreground/40 font-medium leading-relaxed">Send us an email for any questions or support requests.</p>
                                <div className="space-y-1">
                                    <p className="text-primary font-black tracking-[0.05em] text-lg">support@coindarks.com</p>
                                    <p className="text-foreground/40 font-black tracking-[0.05em] text-sm italic">ghana@coindarks.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="group glass-card p-10 rounded-[48px] text-center space-y-8 border border-white/5 hover-lift">
                            <div className="h-20 w-20 rounded-[32px] bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-emerald-500/10">
                                <MessageSquare className="h-10 w-10 text-emerald-500" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black tracking-tight">Live Chat</h3>
                                <p className="text-sm text-foreground/40 font-medium leading-relaxed">Get fast support directly through your dashboard.</p>
                                <Link href="/dashboard/support" className="inline-block">
                                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 hover:text-emerald-400 p-2 border border-emerald-500/20 rounded-xl bg-emerald-500/5">
                                        Open Support Center
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className="group glass-card p-10 rounded-[48px] text-center space-y-8 border border-white/5 hover-lift">
                            <div className="h-20 w-20 rounded-[32px] bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/20 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-amber-500/10">
                                <Clock className="h-10 w-10 text-amber-500" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black tracking-tight">Reliability</h3>
                                <p className="text-sm text-foreground/40 font-medium leading-relaxed">Round-the-clock monitoring and active support in your region.</p>
                                <p className="text-amber-500 font-black tracking-[0.2em] text-[10px] uppercase">Average trade: ~15 Mins</p>
                            </div>
                        </div>
                    </div>

                    {/* Regional Hubs Section */}
                    <div className="space-y-16">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="px-4 py-1.5 rounded-full border border-white/5 glass text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">
                                Our Physical Presence
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Our Physical <span className="text-gradient">Presence.</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            {locations.map((loc) => (
                                <motion.div
                                    key={loc.country}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="space-y-10"
                                >
                                    <div className="relative aspect-video rounded-[48px] overflow-hidden border border-white/5 glass group">
                                        {loc.isComingSoon ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-linear-to-br from-primary/5 via-transparent to-secondary/5">
                                                <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                                                    <Globe className="h-10 w-10 text-foreground/20" />
                                                </div>
                                                <div className="space-y-1 text-center">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Coming Soon</p>
                                                    <p className="text-sm text-foreground/30 font-medium">Strategic Regional Expansion</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
                                                    <a
                                                        href={`https://www.google.com/maps/search/${encodeURIComponent(loc.address || '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-8 py-4 rounded-[20px] bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 transition-transform"
                                                    >
                                                        Open in Google Maps
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>
                                                {loc.mapUrl && (
                                                    <iframe
                                                        src={loc.mapUrl}
                                                        className="w-full h-full border-0 grayscale invert contrast-[1.2] brightness-50 opacity-40 transition-all duration-700 group-hover:scale-110 group-hover:opacity-60"
                                                        title={`Our Office - ${loc.country}`}
                                                        loading="lazy"
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="px-8 space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{loc.country}</span>
                                                <div className="h-1 w-1 rounded-full bg-white/20" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">{loc.city}</span>
                                            </div>
                                            <h3 className="text-3xl font-black tracking-tight">{loc.address}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-4 rounded-[24px] border border-white/5 bg-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                                                    <Phone className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-bold text-foreground/60">{loc.phone}</span>
                                            </div>
                                            <div className="p-4 rounded-[24px] border border-white/5 bg-white/5 flex items-center gap-4 group hover:bg-white/10 transition-colors">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                                                    <Mail className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-bold text-foreground/60">{loc.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Redirect CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-40 pt-32 border-t border-white/5 text-center space-y-12"
                    >
                        <div className="space-y-4">
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
                                Have more <br />
                                <span className="text-gradient">Questions?</span>
                            </h2>
                            <p className="text-xl text-foreground/40 font-medium max-w-2xl mx-auto leading-relaxed">
                                Visit our FAQ for more information about how CoinDarks works and how we keep your funds safe.
                            </p>
                        </div>
                        <Link href="/faq" className="inline-block group">
                            <button className="h-20 px-16 rounded-[32px] bg-primary text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 flex items-center gap-4">
                                Go to FAQ <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14m-7-7 7 7-7 7" />
        </svg>
    );
}
