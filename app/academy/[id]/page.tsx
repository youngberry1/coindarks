"use client";

import { useParams, useRouter } from "next/navigation";
import { academyArticles } from "@/lib/academy-data";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Clock, Calendar, Share2, Bookmark } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ArticlePage() {
    const params = useParams();
    const router = useRouter();
    const article = academyArticles.find(a => a.id === params.id);

    if (!article) return null;

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background pt-32 sm:pt-40 pb-32">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Back Navigation */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-colors mb-12 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Academy
                    </button>

                    {/* Article Header */}
                    <article className="space-y-12">
                        <header className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest">
                                    {article.category}
                                </span>
                                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
                                    {article.title}
                                </h1>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap items-center justify-between gap-6 border-y border-white/5 py-6"
                            >
                                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        {article.readTime}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        {article.date}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-foreground/40 hover:text-primary hover:border-primary/20 transition-all">
                                        <Share2 className="h-4 w-4" />
                                    </button>
                                    <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-foreground/40 hover:text-primary hover:border-primary/20 transition-all">
                                        <Bookmark className="h-4 w-4" />
                                    </button>
                                </div>
                            </motion.div>
                        </header>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="relative aspect-video rounded-[40px] overflow-hidden border border-white/5 shadow-2xl"
                        >
                            <Image
                                src={article.image}
                                alt={article.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="prose prose-invert prose-emerald max-w-none"
                        >
                            <p className="text-xl text-foreground/60 leading-relaxed font-medium mb-12">
                                {article.content}
                            </p>

                            <div className="space-y-12 text-foreground/50 leading-relaxed text-lg">
                                {article.sections.map((section, idx) => (
                                    <div key={idx}>
                                        <h3 className="text-2xl font-black text-white tracking-tight mb-6 uppercase">
                                            {section.title}
                                        </h3>
                                        <p>{section.content}</p>
                                    </div>
                                ))}

                                {article.conclusion && (
                                    <p className="pt-8 border-t border-white/5">
                                        {article.conclusion}
                                    </p>
                                )}

                                {article.featuredQuote && (
                                    <div className="p-8 rounded-[32px] bg-white/2 border border-white/5 italic font-medium text-foreground/70">
                                        &quot;{article.featuredQuote}&quot;
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </article>
                </div>
            </main>
            <Footer />
        </>
    );
}
