"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Quote, Star, MapPin } from "lucide-react";
import { useSyncExternalStore } from "react";

const testimonials = [
    {
        name: "Chidi Eze",
        location: "Lagos, NG",
        text: "CoinDarks has completely changed how I handle my crypto. Instant payouts to my bank every single time!",
        rating: 5,
    },
    {
        name: "Kofi Mensah",
        location: "Accra, GH",
        text: "The best rates for Cedis I've found so far in the market. Fast, secure, and very reliable for daily use.",
        rating: 5,
    },
    {
        name: "Amina Yusuf",
        location: "Abuja, NG",
        text: "Support is top-notch. They helped me through my first exchange in minutes. Amazing platform!",
        rating: 5,
    },
    {
        name: "Kwame Owusu",
        location: "Kumasi, GH",
        text: "I use it daily for my business transactions. The Mobile Money integration is absolute perfection.",
        rating: 5,
    },
    {
        name: "Blessing Okoro",
        location: "Port Harcourt, NG",
        text: "Safety first, and CoinDarks delivers. My go-to platform for all my USDT to Naira exchanges.",
        rating: 5,
    },
    {
        name: "Abena Boateng",
        location: "Tema, GH",
        text: "Clean interface, easy to use. Highly recommended for any Ghanaian looking for a trustworthy bridge.",
        rating: 5,
    },
    {
        name: "Tunde Balogun",
        location: "Ibadan, NG",
        text: "Zero stress. The escrow system gives me total peace of mind. Best exchange experience in Nigeria.",
        rating: 5,
    },
    {
        name: "Ekow Annan",
        location: "Cape Coast, GH",
        text: "The speed of light! I've tried many platforms, but this is the best crypto bridge in West Africa.",
        rating: 5,
    },
];

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = (mouseX / width) - 0.5;
        const yPct = (mouseY / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                rotateX: typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches ? rotateX : 0,
                rotateY: typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches ? rotateY : 0,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group relative h-[300px] w-[400px] shrink-0 rounded-[40px] glass-card border border-white/5 p-10 shadow-sm transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transform-gpu"
        >
            <div
                style={{
                    transform: "translateZ(60px)",
                    transformStyle: "preserve-3d",
                }}
                className="relative z-10 h-full flex flex-col justify-between"
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Quote className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex gap-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                            ))}
                        </div>
                    </div>
                    <p className="text-foreground/70 text-base font-medium leading-relaxed italic">
                        &quot;{testimonial.text}&quot;
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center font-black text-sm uppercase">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-black text-sm tracking-tight">{testimonial.name}</h4>
                        <div className="flex items-center gap-1.5 opacity-40">
                            <MapPin className="h-3 w-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest">{testimonial.location}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ambient Background Shimmer */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
    );
}

export default function Testimonials() {
    const isMounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    if (!isMounted) {
        return <div className="py-32" />;
    }

    const firstRow = testimonials.slice(0, 4);
    const secondRow = testimonials.slice(4, 8);

    return (
        <section id="testimonials" className="py-32 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full -z-10" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-24 text-center space-y-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-secondary/20 shadow-[0_0_20px_rgba(var(--secondary),0.1)]"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Institutional Trust</span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl font-black tracking-tight sm:text-7xl"
                >
                    Peer <span className="text-gradient">Advocacy.</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-foreground/50 max-w-2xl mx-auto text-lg sm:text-xl font-medium"
                >
                    Join thousands of satisfied traders across Ghana and Nigeria who have made
                    CoinDarks their primary bridge for value exchange.
                </motion.p>
            </div>

            {/* Marquee System */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative space-y-12"
            >
                {/* Row 1 */}
                <div className="flex gap-12 overflow-hidden mask-[linear-gradient(to_right,transparent,#000_15%,#000_85%,transparent)]">
                    <motion.div
                        animate={{ x: [0, -2000] }}
                        transition={{
                            duration: 50,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="flex gap-12 shrink-0 py-8"
                    >
                        {[...firstRow, ...firstRow, ...firstRow].map((t, i) => (
                            <TestimonialCard key={i} testimonial={t} />
                        ))}
                    </motion.div>
                </div>

                {/* Row 2 */}
                <div className="flex gap-12 overflow-hidden mask-[linear-gradient(to_right,transparent,#000_15%,#000_85%,transparent)]">
                    <motion.div
                        animate={{ x: [-2000, 0] }}
                        transition={{
                            duration: 60,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="flex gap-12 shrink-0 py-8"
                    >
                        {[...secondRow, ...secondRow, ...secondRow].map((t, i) => (
                            <TestimonialCard key={i} testimonial={t} />
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Edge Fog */}
            <div className="absolute inset-y-0 left-0 w-48 bg-linear-to-r from-background via-background/60 to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-48 bg-linear-to-l from-background via-background/60 to-transparent z-20 pointer-events-none" />
        </section>
    );
}
