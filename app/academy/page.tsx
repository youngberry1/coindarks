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
    const [searchQuery, setSearchQuery] = useState("");

    const categories = ["All Guides", "Safety", "Guides", "Market"];

    const filteredArticles = useMemo(() => {
        let articles = academyArticles;

        // Filter by category
        if (activeCategory !== "All Guides") {
            articles = articles.filter(article => article.category === activeCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            articles = articles.filter(article =>
                article.title.toLowerCase().includes(query) ||
                article.excerpt.toLowerCase().includes(query) ||
                article.category.toLowerCase().includes(query)
            );
        }

        return articles;
    }, [activeCategory, searchQuery]);
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-background">
                <AcademyHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

                <section className="pb-32 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Filter Bar */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
                            <div className="w-full sm:w-fit grid grid-cols-2 md:flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 md:p-1.5 md:rounded-2xl">
                                {categories.map((filter) => {
                                    const isActive = activeCategory === filter;
                                    return (
                                        <button
                                            key={filter}
                                            onClick={() => setActiveCategory(filter)}
                                            className={cn(
                                                "flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all relative whitespace-nowrap md:px-6 md:py-2.5 md:text-sm",
                                                isActive ? "text-primary" : "text-foreground/40 hover:text-foreground hover:bg-white/5"
                                            )}
                                        >
                                            <span>{filter}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="academyActiveCategory"
                                                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg md:rounded-xl -z-10"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
                                {filteredArticles.length} Article{filteredArticles.length !== 1 ? 's' : ''} {searchQuery ? 'Found' : ''}
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
