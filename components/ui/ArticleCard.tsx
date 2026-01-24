"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, Calendar } from "lucide-react";
import { Article } from "@/lib/academy-data";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
    article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
    return (
        <motion.div
            layout
            className="group relative flex flex-col h-full rounded-[32px] overflow-hidden glass-card border border-white/5 hover:border-primary/20 transition-all duration-500"
        >
            <Link href={`/academy/${article.id}`} className="flex flex-col h-full">
                {/* Image Section */}
                <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent opacity-60" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md",
                            article.category === "Safety" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                article.category === "Guides" ? "bg-primary/10 text-primary border-primary/20" :
                                    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        )}>
                            {article.category}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col flex-1 gap-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {article.date}
                        </div>
                    </div>

                    <h3 className="text-xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {article.title}
                    </h3>

                    <p className="text-sm text-foreground/50 leading-relaxed font-medium line-clamp-2">
                        {article.excerpt}
                    </p>

                    <div className="mt-auto pt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary group-hover:translate-x-1 transition-transform">
                        Read Full Article <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                </div>
            </Link>

            {/* Subtle Overlay Finish */}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none" />
        </motion.div>
    );
}
