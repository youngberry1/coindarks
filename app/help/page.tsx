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
    Globe,
    ExternalLink
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function HelpPage() {
    const locations = [
        {
            country: "Ghana",
            city: "Accra",
            address: "Suite 402, Heritage Tower, Ridge, Accra",
            phone: "+233 24 000 0000",
            email: "ghana@coindarks.com",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15883.56561214!2d-0.20!3d5.55!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMzMnMDAuMCJOIDDCsDEyJzAwLjAiVw!5e0!3m2!1sen!2sgh!4v1625000000000!5m2!1sen!2sgh"
        },
        {
            country: "Nigeria",
            city: "Lagos",
            address: "15 Admiralty Way, Lekki Phase 1, Lagos",
            phone: "+234 81 000 0000",
            email: "nigeria@coindarks.com",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.4!2d3.4!3d6.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjQnMDAuMCJOIDPCsDI0JzAwLjAiRQ!5e0!3m2!1sen!2sng!4v1625000000000!5m2!1sen!2sng"
        }
    ];


    return (
        <>
            <header>
                <Navbar />
            </header>

            <main className="pt-32 pb-24 bg-background">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16 text-center"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-primary transition-colors mb-8"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Return Home
                        </Link>

                        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6">Need <span className="text-gradient">Assistance?</span></h1>
                        <p className="text-foreground/60 font-medium text-lg max-w-2xl mx-auto">
                            We&apos;re here to help you bridge the gap between Crypto and Fiat. Reach out through any of our official channels.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
                        {/* Contact Quick Cards */}
                        <div className="p-8 rounded-[40px] border border-white/5 bg-white/5 backdrop-blur-md flex flex-col items-center text-center group hover:border-primary/20 transition-all">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Email Support</h3>
                            <p className="text-sm text-foreground/50 font-medium mb-6">Official inquiries and tickets</p>
                            <p className="text-primary font-black tracking-tight">support@coindarks.com</p>
                        </div>

                        <div className="p-8 rounded-[40px] border border-white/5 bg-white/5 backdrop-blur-md flex flex-col items-center text-center group hover:border-emerald-500/20 transition-all">
                            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <MessageSquare className="h-6 w-6 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Live Chat</h3>
                            <p className="text-sm text-foreground/50 font-medium mb-6">Instant help via dashboard</p>
                            <Link href="/dashboard/support">
                                <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:underline">Open Support Hub</button>
                            </Link>
                        </div>

                        <div className="p-8 rounded-[40px] border border-white/5 bg-white/5 backdrop-blur-md flex flex-col items-center text-center group hover:border-amber-500/20 transition-all">
                            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Clock className="h-6 w-6 text-amber-500" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Availability</h3>
                            <p className="text-sm text-foreground/50 font-medium mb-6">24/7 Monitoring</p>
                            <p className="text-amber-500 font-black tracking-tight">Response: ~15 Mins</p>
                        </div>
                    </div>

                    {/* Locations Section */}
                    <div className="space-y-12">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-black tracking-tight flex items-center gap-4">
                                <Globe className="h-8 w-8 text-primary" />
                                Our Regional <span className="text-gradient">Hubs</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {locations.map((loc) => (
                                <div key={loc.country} className="space-y-6">
                                    <div className="relative aspect-video rounded-[40px] overflow-hidden border border-white/5 bg-white/5 group">
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <a
                                                href={`https://www.google.com/maps/search/${encodeURIComponent(loc.address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-3 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                                            >
                                                View on Google Maps
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                        <iframe
                                            src={loc.mapUrl}
                                            className="w-full h-full border-0 grayscale invert brightness-75 opacity-50 transition-all group-hover:scale-105 group-hover:opacity-80"
                                            title={`Map of ${loc.country} office`}
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="px-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{loc.country}</span>
                                            <span className="h-1 w-1 rounded-full bg-white/10" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{loc.city}</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-4">{loc.address}</h3>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3 text-sm text-foreground/60 font-medium">
                                                <Phone className="h-4 w-4 text-primary" />
                                                {loc.phone}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-foreground/60 font-medium">
                                                <Mail className="h-4 w-4 text-primary" />
                                                {loc.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ Redirect CTA */}
                    <div className="mt-32 pt-24 border-t border-white/5 text-center">
                        <h2 className="text-3xl font-black tracking-tight mb-6">Need More Detailed <span className="text-gradient">Information?</span></h2>
                        <p className="text-foreground/60 font-medium text-lg max-w-2xl mx-auto mb-10">
                            Check out our comprehensive FAQ for in-depth answers about security, payments, and our bridge technology.
                        </p>
                        <Link href="/faq">
                            <button className="px-12 py-5 rounded-full bg-primary text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20">
                                View Full FAQ Center
                            </button>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}
