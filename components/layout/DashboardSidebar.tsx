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
    ChevronRight
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/ui/Logo";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ThemeToggle } from "@/components/ThemeToggle";

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
        { name: "Buy / Sell", href: "/dashboard/exchange", icon: RefreshCcw },
        { name: "My Orders", href: "/dashboard/orders", icon: History },
        { name: "Wallets", href: "/dashboard/wallets", icon: Wallet },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
        { name: "Support", href: "/dashboard/support", icon: Mail },
    ];

    const adminLinks = [
        { name: "Admin Home", href: "/admin", icon: LayoutDashboard },
        { name: "KYC Review", href: "/admin/kyc", icon: ShieldCheck },
        { name: "All Orders", href: "/admin/orders", icon: Package },
        { name: "User Base", href: "/admin/users", icon: Users },
        { name: "Support", href: "/admin/support", icon: Mail },
        { name: "System Settings", href: "/admin/settings", icon: Settings },
    ];

    const links = isAdmin ? adminLinks : userLinks;

    const renderContent = (onClose?: () => void) => (
        <div className="flex flex-col h-full">
            <div className="mb-14 md:mb-16 flex items-center justify-between px-2">
                <Logo className="scale-90 md:scale-100 origin-left" />
                {onClose && (
                    <VisuallyHidden>
                        <span>Close</span>
                    </VisuallyHidden>
                )}
            </div>

            {/* User Profile Summary */}
            <div className="mb-12 p-5 rounded-[28px] bg-linear-to-br from-primary/10 to-transparent border border-border">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20 overflow-hidden relative">
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
                    <div className="overflow-hidden">
                        <p className="font-bold truncate leading-none mb-1">{user?.name || "User"}</p>
                        <p className="text-[10px] text-foreground/60 truncate uppercase tracking-widestBold">{isAdmin ? "Administrator" : "Trader"}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] px-4 mb-6">
                    {isAdmin ? "Management" : "Main Navigation"}
                </p>
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => onClose?.()}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${isActive
                                ? "bg-primary text-white shadow-xl shadow-primary/20"
                                : "text-foreground/50 hover:bg-white/5 hover:text-foreground"
                                }`}
                        >
                            <link.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-foreground/50 group-hover:text-primary"}`} />
                            <span className="font-bold text-sm tracking-tight">{link.name}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="ml-auto"
                                >
                                    <ChevronRight className="h-4 w-4 opacity-50" />
                                </motion.div>
                            )}
                        </Link>
                    );
                })}

                {isAdmin && (
                    <>
                        <div className="pt-6 pb-2">
                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] px-4">Trader View</p>
                        </div>
                        {userLinks.slice(0, 2).map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => onClose?.()}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${isActive
                                        ? "bg-primary text-white shadow-xl shadow-primary/20"
                                        : "text-foreground/50 hover:bg-white/5 hover:text-foreground"
                                        }`}
                                >
                                    <link.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-foreground/30 group-hover:text-primary"}`} />
                                    <span className="font-bold text-sm tracking-tight">{link.name}</span>
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            <div className="mt-auto pt-6 space-y-4">
                {!isAdmin && (
                    <div className={`p-4 rounded-3xl border flex items-center justify-between ${kycStatus === 'APPROVED' ? 'bg-emerald-500/5 border-emerald-500/10' :
                        kycStatus === 'REJECTED' ? 'bg-red-500/5 border-red-500/10' :
                            'bg-amber-500/5 border-amber-500/10'
                        }`}>
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${kycStatus === 'APPROVED' ? 'text-emerald-500' :
                                kycStatus === 'REJECTED' ? 'text-red-500' :
                                    'text-amber-500'
                                }`}>KYC Status</p>
                            <div className="flex items-center gap-1.5">
                                <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${kycStatus === 'APPROVED' ? 'bg-emerald-500' :
                                    kycStatus === 'REJECTED' ? 'bg-red-500' :
                                        'bg-amber-500'
                                    }`} />
                                <span className="text-[12px] font-black uppercase tracking-tight">
                                    {kycStatus === 'UNSUBMITTED' ? 'Unverified' : kycStatus === 'APPROVED' ? 'Verified' : kycStatus}
                                </span>
                            </div>
                        </div>
                        <ShieldCheck className={`h-6 w-6 ${kycStatus === 'APPROVED' ? 'text-emerald-500/30' :
                            kycStatus === 'REJECTED' ? 'text-red-500/30' :
                                'text-amber-500/30'
                            }`} />
                    </div>
                )}

                <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Appearance</span>
                    <ThemeToggle />
                </div>

                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-4 w-full px-5 py-5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-black uppercase tracking-widest text-[11px] group"
                >
                    <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 z-50 bg-card-bg/40 backdrop-blur-2xl border-r border-white/5 p-6">
                {renderContent()}
            </aside>

            {/* Mobile Sidebar Trigger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 p-4 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-white/5">
                <Logo className="scale-75" />
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <button
                            className="p-2.5 rounded-2xl bg-white/5 border border-white/10"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[340px] border-r border-white/10 bg-background/95 backdrop-blur-xl p-6">
                        <VisuallyHidden>
                            <SheetTitle>Navigation Menu</SheetTitle>
                            <SheetDescription>Dashboard navigation menu</SheetDescription>
                        </VisuallyHidden>
                        {renderContent(() => setIsMobileOpen(false))}
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
