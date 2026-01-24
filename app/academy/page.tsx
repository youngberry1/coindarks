"use client";

import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AcademyHero } from "@/components/sections/AcademyHero";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { academyArticles } from "@/lib/academy-data";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export default function AcademyPage() {
    const [activeCategory, setActiveCategory] = useState("All Guides");

    const categories = ["All Guides", "Safety", "Guides", "Market"];

    const filteredArticles = useMemo(() => {
        if (activeCategory === "All Guides") return academyArticles;
        return academyArticles.filter(article => article.category === activeCategory);
    }, [activeCategory]);
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                <AcademyHero />

                <section className="pb-32 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Filter Bar Placeholder */}
                        <div className="flex items-center justify-between mb-12 pb-6 border-b border-white/5">
                            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-2">
                                {categories.map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveCategory(filter)}
                                        className={cn(
                                            "text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap relative pb-2",
                                            activeCategory === filter ? "text-primary" : "text-foreground/40 hover:text-foreground"
                                        )}
                                    >
                                        {filter}
                                        {activeCategory === filter && (
                                            <motion.div
                                                layoutId="activeCategory"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-foreground/20">
                                {filteredArticles.length} Articles Found
                            </span>
                        </div>

                        {/* Article Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 min-h-[400px]">
                            {filteredArticles.map((article) => (
                                <ArticleCard
                                    key={article.id}
                                    article={article}
                                />
                            ))}
                        </div>

                        {/* Pagination / Load More Simulation */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="mt-20 flex flex-col items-center gap-6"
                        >
                            <div className="h-px w-24 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">
                                End of Current Feed
                            </p>
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
