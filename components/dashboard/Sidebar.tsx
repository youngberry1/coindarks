"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Wallet,
    History,
    Settings,
    ShieldCheck,
    Users,
    LogOut,
    Menu,
    X,
    ShieldAlert,
    TrendingUp,
    Activity,
    LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { UserRole } from "@/types/db";

const mainNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Exchange", href: "/exchange", icon: Wallet },
    { label: "Orders", href: "/orders", icon: History },
    { label: "Wallets", href: "/wallets", icon: Wallet },
];

const supportNavItems = [
    { label: "KYC Verification", href: "/admin/dashboard", icon: ShieldAlert },
    { label: "User Management", href: "/admin/users", icon: Users },
];

const financeNavItems = [
    { label: "Exchange Volume", href: "/admin/dashboard", icon: TrendingUp },
    { label: "Transaction Logs", href: "/admin/finance", icon: Activity },
];

const adminNavItems = [
    { label: "System Health", href: "/admin/dashboard", icon: ShieldCheck },
    { label: "Staff Analytics", href: "/admin/analytics", icon: LineChart },
];

const footerNavItems = [
    { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
    role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const isAdmin = role === "ADMIN";
    const isSupport = role === "SUPPORT" || isAdmin;
    const isFinance = role === "FINANCE" || isAdmin;

    const toggleSidebar = () => setIsOpen(!isOpen);

    const NavLink = ({ item }: { item: typeof mainNavItems[0] }) => (
        <Link
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                pathname === item.href
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
            )}
        >
            <item.icon className={cn(
                "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                pathname === item.href ? "text-white" : "text-primary"
            )} />
            <span className="font-medium">{item.label}</span>
        </Link>
    );

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-6 left-6 z-50 p-2 rounded-xl glass-morphism border border-white/10 hover:bg-white/5 transition-colors"
                aria-label="Toggle Sidebar"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 left-0 bottom-0 z-40 w-72 glass-morphism border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo */}
                <div className="p-8">
                    <Link
                        href="/dashboard"
                        className="text-2xl font-black tracking-tighter text-gradient"
                        onClick={() => setIsOpen(false)}
                    >
                        COINDARKS
                    </Link>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 space-y-8 overflow-y-auto pt-4">
                    {/* User Nav */}
                    <div className="space-y-2">
                        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-4">
                            General
                        </p>
                        {mainNavItems.map((item) => (
                            <NavLink key={item.href} item={item} />
                        ))}
                    </div>

                    {/* Support Nav */}
                    {isSupport && (
                        <div className="space-y-2">
                            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-4 transition-colors">
                                Support & Compliance
                            </p>
                            {supportNavItems.map((item) => (
                                <NavLink key={item.href} item={item} />
                            ))}
                        </div>
                    )}

                    {/* Finance Nav */}
                    {isFinance && (
                        <div className="space-y-2">
                            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-4 transition-colors">
                                Finance & Treasury
                            </p>
                            {financeNavItems.map((item) => (
                                <NavLink key={item.href} item={item} />
                            ))}
                        </div>
                    )}

                    {/* Admin Nav */}
                    {isAdmin && (
                        <div className="space-y-2">
                            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-4 transition-colors">
                                System Administration
                            </p>
                            {adminNavItems.map((item) => (
                                <NavLink key={item.href} item={item} />
                            ))}
                        </div>
                    )}
                </nav>

                {/* Footer Nav */}
                <div className="p-4 space-y-2 border-t border-white/5">
                    {footerNavItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-200 group"
                    >
                        <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
