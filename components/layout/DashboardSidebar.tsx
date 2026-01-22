"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    RefreshCcw,
    History,
    Wallet,
    Settings,
    ShieldCheck,
    Users,
    Package,
    Mail,
    LogOut,
    Menu,
    ChevronRight,
    Megaphone,
    BookOpen,
    Sparkles,
    Activity
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/ui/Logo";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

interface SidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
        role?: string | null;
        id?: string | null;
        kyc_status?: string | null;
        profile_image?: string | null;
    };
}

export function DashboardSidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const isAdmin = user?.role === "ADMIN";
    const kycStatus = user?.kyc_status || 'UNSUBMITTED';

    const userLinks = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Exchange", href: "/dashboard/exchange", icon: RefreshCcw },
        { name: "Order History", href: "/dashboard/orders", icon: History },
        { name: "Wallets & Accounts", href: "/dashboard/wallets", icon: Wallet },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
        { name: "Help & Support", href: "/dashboard/support", icon: Mail },
    ];

    const adminLinks = [
        { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "KYC Verifications", href: "/admin/kyc", icon: ShieldCheck },
        { name: "System Orders", href: "/admin/orders", icon: Package },
        { name: "User Management", href: "/admin/users", icon: Users },
        { name: "Customer Support", href: "/admin/support", icon: Mail },
        { name: "Documentation", href: "/admin/docs", icon: BookOpen },
        { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
        { name: "General Settings", href: "/admin/settings", icon: Settings },
    ];

    const links = isAdmin ? adminLinks : userLinks;

    const renderContent = (onClose?: () => void) => (
        <div className="flex flex-col h-full py-4">
            {/* Header */}
            <div className="mb-12 flex items-center justify-between px-4">
                <Logo className="scale-90 origin-left" />
                {!onClose && (
                    <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                )}
            </div>

            {/* Profile Block */}
            <div className="mb-10 px-4">
                <div className="relative group p-4 rounded-[32px] glass-card border border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-primary/20 overflow-hidden shrink-0 border border-white/10 ring-4 ring-primary/5">
                            {user?.profile_image ? (
                                <Image
                                    src={user.profile_image}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                user?.name?.[0] || user?.email?.[0]?.toUpperCase()
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-black text-sm truncate tracking-tight mb-0.5">{user?.name || "User Account"}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-foreground/40 font-black uppercase tracking-widest">{isAdmin ? "Administrator" : "Member Account"}</span>
                                <div className="h-1 w-1 rounded-full bg-primary/40" />
                                {isAdmin && <Sparkles className="h-3 w-3 text-primary" />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 custom-scrollbar">
                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] px-4 mb-4 mt-6">
                    {isAdmin ? "Infrastructure" : "Main Menu"}
                </p>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => onClose?.()}
                            className={cn(
                                "flex items-center gap-4 px-5 py-4 rounded-[24px] transition-all duration-300 group relative",
                                isActive
                                    ? "bg-primary text-white shadow-2xl shadow-primary/30 active-card"
                                    : "text-foreground/40 hover:bg-white/5 hover:text-foreground"
                            )}
                        >
                            <link.icon className={cn(
                                "h-5 w-5 transition-all duration-500 group-hover:scale-110 shrink-0",
                                isActive ? "text-white scale-110" : "text-foreground/30 group-hover:text-primary"
                            )} />
                            <span className="font-black text-[13px] tracking-tight whitespace-nowrap">{link.name}</span>

                            {isActive && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    className="ml-auto"
                                >
                                    <div className="h-5 w-5 rounded-lg bg-white/20 flex items-center justify-center">
                                        <ChevronRight className="h-3 w-3 text-white" />
                                    </div>
                                </motion.div>
                            )}
                        </Link>
                    );
                })}

                {isAdmin && (
                    <div className="mt-8 pt-8 border-t border-white/5">
                        <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] px-4 mb-4">Quick Access</p>
                        {userLinks.slice(0, 2).map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => onClose?.()}
                                className="flex items-center gap-4 px-5 py-4 rounded-[24px] text-foreground/40 hover:bg-white/5 hover:text-foreground transition-all duration-300 group"
                            >
                                <link.icon className="h-5 w-5 text-foreground/20 group-hover:text-primary transition-colors" />
                                <span className="font-black text-[13px] tracking-tight">{link.name}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </nav>

            {/* Footer Actions */}
            <div className="mt-auto px-4 pt-8 space-y-4">
                {!isAdmin && (
                    <div className={cn(
                        "p-5 rounded-[32px] border group transition-all duration-500 overflow-hidden relative",
                        kycStatus === 'APPROVED' ? 'bg-emerald-500/5 border-emerald-500/10' :
                            kycStatus === 'REJECTED' ? 'bg-red-500/5 border-red-500/10' :
                                'bg-amber-500/5 border-amber-500/10'
                    )}>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.2em] mb-1",
                                    kycStatus === 'APPROVED' ? 'text-emerald-500' :
                                        kycStatus === 'REJECTED' ? 'text-red-500' :
                                            'text-amber-500'
                                )}>Verification Status</p>
                                <div className="flex items-center gap-1.5">
                                    <div className={cn(
                                        "h-1.5 w-1.5 rounded-full animate-pulse",
                                        kycStatus === 'APPROVED' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                            kycStatus === 'REJECTED' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                                'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                    )} />
                                    <span className="text-[12px] font-black uppercase tracking-tight">
                                        {kycStatus === 'UNSUBMITTED' ? 'KYC Required' : kycStatus === 'APPROVED' ? 'Verified Account' : kycStatus}
                                    </span>
                                </div>
                            </div>
                            <ShieldCheck className={cn(
                                "h-8 w-8 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12",
                                kycStatus === 'APPROVED' ? 'text-emerald-500/20' :
                                    kycStatus === 'REJECTED' ? 'text-red-500/20' :
                                        'text-amber-500/20'
                            )} />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between px-5 py-3.5 glass-card rounded-[24px] border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Interface Mode</span>
                    </div>
                    <ThemeToggle />
                </div>

                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-4 w-full px-6 py-5 rounded-[24px] text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 font-black uppercase tracking-[0.2em] text-[10px] group"
                >
                    <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-500" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-80 z-50 bg-background/40 backdrop-blur-[60px] border-r border-white/5 pt-4">
                {renderContent()}
            </aside>

            {/* Mobile Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 p-4 flex items-center justify-between bg-background/60 backdrop-blur-3xl border-b border-white/5">
                <Logo className="scale-75 origin-left" />
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <button
                                className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-95"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[320px] sm:w-[360px] border-r border-white/10 bg-background/95 backdrop-blur-3xl p-0">
                            <VisuallyHidden>
                                <SheetTitle>Navigation Menu</SheetTitle>
                                <SheetDescription>Access your account features and settings</SheetDescription>
                            </VisuallyHidden>
                            {renderContent(() => setIsMobileOpen(false))}
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </>
    );
}

