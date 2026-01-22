"use client";

import { useTheme } from "next-themes";
import React, { useSyncExternalStore } from "react";

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();

    // Avoid hydration mismatch using React 18+ recommended pattern
    const isMounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    if (!isMounted) {
        return (
            <div className="w-[49px] h-[28px] rounded-full bg-neutral-700/20 animate-pulse" />
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <label className="switch" aria-label="Toggle Theme">
            <input
                type="checkbox"
                checked={isDark}
                onChange={() => setTheme(isDark ? "light" : "dark")}
            />
            <span className="slider"></span>
        </label>
    );
}
