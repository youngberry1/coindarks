'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, MoveLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NotFound() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative min-h-screen w-full bg-[#030303] overflow-hidden flex flex-col items-center justify-center text-white selection:bg-primary/30">

            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div
                    className="absolute w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-20 transition-transform duration-75 ease-out"
                    style={{
                        transform: `translate(${mousePosition.x / 10}px, ${mousePosition.y / 10}px)`,
                        top: '-20%',
                        left: '-10%'
                    }}
                />
                <div
                    className="absolute w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] opacity-20 transition-transform duration-75 ease-out"
                    style={{
                        transform: `translate(${mousePosition.x / -15}px, ${mousePosition.y / -15}px)`,
                        bottom: '-10%',
                        right: '-10%'
                    }}
                />
            </div>

            {/* Floating Particles/Grid Background */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="relative z-10 w-full max-w-4xl px-6 text-center">

                {/* 404 GLITCH TEXT */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    <h1 className="text-[12rem] md:text-[18rem] font-black leading-none tracking-tighter select-none mix-blend-difference relative">
                        <span className="relative z-20 bg-clip-text text-transparent bg-linear-to-b from-white to-white/10">
                            404
                        </span>

                        {/* Glitch Layers */}
                        <motion.span
                            animate={{
                                x: [-2, 2, -1, 0],
                                y: [1, -1, 0],
                                opacity: [0.8, 0.5, 0]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 2,
                                repeatDelay: 3
                            }}
                            className="absolute top-0 left-0 w-full h-full text-primary/40 -z-10 blur-[1px]"
                        >
                            404
                        </motion.span>
                        <motion.span
                            animate={{
                                x: [2, -2, 1, 0],
                                opacity: [0.8, 0.5, 0]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 2.5,
                                repeatDelay: 4
                            }}
                            className="absolute top-0 left-0 w-full h-full text-purple-500/40 -z-10 blur-[1px]"
                        >
                            404
                        </motion.span>
                    </h1>
                </motion.div>

                {/* Subtext */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="space-y-6 -mt-8 md:-mt-16 relative z-30"
                >
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        <span className="text-primary">Block</span> Not Found
                    </h2>
                    <p className="text-white/40 max-w-md mx-auto text-sm md:text-base leading-relaxed">
                        The transaction you are looking for has been lost in the dark side of the mempool. It may have been moved, deleted, or never existed.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative px-8 py-3 bg-white text-black font-bold rounded-full overflow-hidden flex items-center gap-2"
                            >
                                <div className="absolute inset-0 bg-linear-to-r from-primary via-purple-500 to-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                                <Home className="w-4 h-4" />
                                Return to Base
                            </motion.button>
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition-all font-medium flex items-center gap-2 text-sm"
                        >
                            <MoveLeft className="w-4 h-4" />
                            Go Back
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Decorative Floating Symbols */}
            <FloatingSymbol symbol="$" delay={1} x={-200} y={-150} />
            <FloatingSymbol symbol="{" delay={2} x={250} y={-100} />
            <FloatingSymbol symbol="}" delay={3} x={-250} y={150} />
            <FloatingSymbol symbol="#" delay={1.5} x={300} y={200} />

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 text-white/20 text-xs tracking-widest uppercase"
            >
                Error Code: 0x404_PAGE_MISSING
            </motion.div>
        </div>
    );
}

function FloatingSymbol({ symbol, delay, x, y }: { symbol: string, delay: number, x: number, y: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: [0, 0.1, 0],
                y: [y, y - 50, y],
                x: [x, x + 20, x],
                rotate: [0, 10, -10, 0]
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
            className="absolute font-mono text-4xl filter-bold text-white pointer-events-none select-none blur-[2px]"
            style={{
                left: '50%',
                top: '50%',
                marginLeft: x,
                marginTop: y
            }}
        >
            {symbol}
        </motion.div>
    );
}
