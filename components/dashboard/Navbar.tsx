"use client";

import { User } from "next-auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, Search, User as UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";

interface NavbarProps {
    user?: User;
}

export function Navbar({ user }: NavbarProps) {
    return (
        <header className="h-20 border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-30 px-6 lg:px-10 flex items-center justify-between">
            {/* Left side - Search or Page Title */}
            <div className="flex-1 max-w-md hidden md:block">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="w-full bg-foreground/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 sm:gap-4 ml-auto lg:ml-0">
                <ThemeToggle />

                <button className="p-2 rounded-xl hover:bg-foreground/5 transition-colors relative">
                    <Bell className="h-5 w-5 text-foreground/60" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-background" />
                </button>

                <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

                {/* User Profile Summary */}
                <div className="flex items-center gap-3 pl-2">
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-bold truncate max-w-[150px]">
                            {user?.name || "User"}
                        </p>
                        <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">
                            {user?.email}
                        </p>
                    </div>

                    <button
                        onClick={() => signOut()}
                        className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
                        title="Sign Out"
                    >
                        <UserIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
