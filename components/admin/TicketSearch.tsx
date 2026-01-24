"use client";

import { Search, Loader2 } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useTransition } from "react";

export function TicketSearch() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }

        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    }, 300);

    return (
        <div className="relative w-full md:w-auto">
            <div className="relative group">
                {isPending ? (
                    <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin z-10" />
                ) : (
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 z-10 group-focus-within:text-primary transition-colors" />
                )}
                {/* 
                   Fix for iOS "White Leak":
                   - removed bg-white/5 (transparent)
                   - added bg-card (solid) 
                   - explicit appearance-none
                   - autocomplete="off"
                */}
                <input
                    type="text"
                    placeholder="Search tickets..."
                    autoComplete="off"
                    autoCorrect="off"
                    className="flex h-12 w-full md:w-[320px] rounded-2xl border border-white/5 bg-[#0A0A0A] pl-11 pr-4 text-sm font-bold text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm appearance-none"
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('q')?.toString()}
                />
            </div>
        </div>
    );
}
