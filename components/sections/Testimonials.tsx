"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";

const testimonials = [
    {
        name: "Chidi Eze",
        location: "Lagos, Nigeria",
        text: "CoinDarks has completely changed how I handle my crypto. Instant payouts to my bank every single time!",
        rating: 5,
    },
    {
        name: "Kofi Mensah",
        location: "Accra, Ghana",
        text: "The best rates for Cedis I've found so far in the market. Fast, secure, and very reliable for daily use.",
        rating: 5,
    },
    {
        name: "Amina Yusuf",
        location: "Abuja, Nigeria",
        text: "Support is top-notch. They helped me through my first exchange in minutes. Amazing platform!",
        rating: 5,
    },
    {
        name: "Kwame Owusu",
        location: "Kumasi, Ghana",
        text: "I use it daily for my business transactions. The Mobile Money integration is absolute perfection.",
        rating: 5,
    },
    {
        name: "Blessing Okoro",
        location: "Port Harcourt, Nigeria",
        text: "Safety first, and CoinDarks delivers. My go-to platform for all my USDT to Naira exchanges.",
        rating: 5,
    },
    {
        name: "Abena Boateng",
        location: "Tema, Ghana",
        text: "Clean interface, easy to use. Highly recommended for any Ghanaian looking for a trustworthy bridge.",
        rating: 5,
    },
    {
        name: "Tunde Balogun",
        location: "Ibadan, Nigeria",
        text: "Zero stress. The escrow system gives me total peace of mind. Best exchange experience in Nigeria.",
        rating: 5,
    },
    {
        name: "Ekow Annan",
        location: "Cape Coast, Ghana",
        text: "The speed of light! I've tried many platforms, but this is the best crypto bridge in West Africa.",
        rating: 5,
    },
    {
        name: "Zainab Bello",
        location: "Kano, Nigeria",
        text: "Transacting from the north is simple with their network. Very reliable and always available.",
        rating: 5,
    },
    {
        name: "Yaw Appiah",
        location: "Sunyani, Ghana",
        text: "Trustworthy and lightning fast. I've never had a delay with my withdrawals. Simply the best.",
        rating: 5,
    },
    {
        name: "Oluwaseun Ajayi",
        location: "Lekki, Nigeria",
        text: "Premium experience. The UI is better than most global apps. It truly feels like world-class software.",
        rating: 5,
    },
    {
        name: "Ama Serwaa",
        location: "Takoradi, Ghana",
        text: "Fastest Momo withdrawals I've ever experienced. Great job to the team behind CoinDarks!",
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
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group relative h-[280px] w-[350px] shrink-0 rounded-[32px] border border-border/40 bg-card/40 backdrop-blur-xl p-8 shadow-sm transition-all hover:bg-card/60 hover:border-primary/30 hover:shadow-xl"
        >
            <div
                style={{
                    transform: "translateZ(50px)",
                    transformStyle: "preserve-3d",
                }}
                className="relative z-10 h-full flex flex-col justify-between"
            >
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Quote className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex gap-0.5">
                            {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                            ))}
                        </div>
                    </div>
                    <p className="text-foreground/70 font-medium leading-relaxed italic">
                        &quot;{testimonial.text}&quot;
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center font-bold text-xs">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm tracking-tight">{testimonial.name}</h4>
                        <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">{testimonial.location}</p>
                    </div>
                </div>
            </div>

            {/* Subtle Gradient Glow */}
            <div className="absolute inset-0 rounded-[32px] bg-linear-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
}

export default function Testimonials() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="py-24" />; // Placeholder to avoid jump

    const firstRow = testimonials.slice(0, 6);
    const secondRow = testimonials.slice(6, 12);

    return (
        <section id="testimonials" className="py-24 relative overflow-hidden bg-background">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Trusted by 10k+ Africans</span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl font-black tracking-tight sm:text-6xl mb-6"
                >
                    Stories from <span className="text-gradient">Our Community</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-foreground/50 max-w-2xl mx-auto text-lg font-medium"
                >
                    Experience why users across Ghana and Nigeria choose CoinDarks for their daily crypto bridge. Security, speed, and absolute transparency.
                </motion.p>
            </div>

            {/* Marquee Rows */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative flex flex-col gap-8"
            >
                {/* Row 1 - Left */}
                <div className="flex gap-8 overflow-hidden mask-[linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)]">
                    <motion.div
                        animate={{ x: [0, -1920] }}
                        transition={{
                            duration: 40,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="flex gap-8 shrink-0 py-4"
                    >
                        {[...firstRow, ...firstRow].map((t, i) => (
                            <TestimonialCard key={i} testimonial={t} />
                        ))}
                    </motion.div>
                </div>

                {/* Row 2 - Right */}
                <div className="flex gap-8 overflow-hidden mask-[linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)]">
                    <motion.div
                        animate={{ x: [-1920, 0] }}
                        transition={{
                            duration: 45,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="flex gap-8 shrink-0 py-4"
                    >
                        {[...secondRow, ...secondRow].map((t, i) => (
                            <TestimonialCard key={i} testimonial={t} />
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Side gradients to hide edges better */}
            <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-background to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-background to-transparent z-20 pointer-events-none" />
        </section>
    );
}
