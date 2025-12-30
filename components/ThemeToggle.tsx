"use client";

import { useTheme } from "next-themes";
import React, { useState } from "react";

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-24 h-12 rounded-full bg-neutral-700/50 animate-pulse" />
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <label className="relative inline-flex items-center cursor-pointer scale-75 sm:scale-90 md:scale-100 transition-transform origin-right" aria-label="Toggle Theme">
            <input
                className="sr-only peer"
                type="checkbox"
                checked={isDark}
                onChange={() => setTheme(isDark ? "light" : "dark")}
            />
            <div className="group peer ring-2 ring-white/10 dark:ring-white/5 bg-linear-to-bl from-neutral-800 via-neutral-700 to-neutral-600 rounded-full outline-none duration-1000 after:duration-300 w-24 h-12 shadow-md peer-focus:outline-none after:content-[''] after:rounded-full after:absolute peer-checked:after:rotate-180 after:[background:conic-gradient(from_135deg,#b2a9a9,#b2a8a8,#ffffff,#d7dbd9,#ffffff,#b2a8a8)] after:outline-none after:h-10 after:w-10 after:top-1 after:left-1 peer-checked:after:translate-x-12 peer-hover:after:scale-110">
            </div>
        </label>
    );
}
