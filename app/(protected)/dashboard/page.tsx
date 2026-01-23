import { auth } from "@/auth";
import { Metadata } from "next";
import {
    AlertCircle,
    ArrowUpRight,
    ArrowDownLeft,
    ShieldAlert,
    CheckCircle2,
    Globe,
    ExternalLink,
    RefreshCcw,
    ShieldCheck,
    Sparkles,
    Activity,
    MessageSquare,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import TradeableAssets from '@/components/dashboard/TradeableAssets';
import { getCryptos } from '@/actions/crypto';
import { getUserTickets } from "@/actions/support";
import { AnnouncementBanner } from "@/components/dashboard/AnnouncementBanner";
import { getActiveAnnouncements } from "@/actions/announcements";
import { Announcement } from "@/types/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Dashboard | CoinDarks",
    description: "Manage your crypto assets and transactions in one place.",
};

export default async function DashboardPage() {
    const session = await auth();
    const user = session?.user;

    // Fetch user details for KYC status
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('kyc_status')
        .eq('id', user?.id)
        .single();

    // Fetch recent support tickets
    const tickets = await getUserTickets();
    const recentTickets = tickets.slice(0, 3);

    // Fetch recent orders for support linking
    const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, asset, amount_crypto')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

    const kycStatus = userData?.kyc_status || 'UNSUBMITTED';
    const isAdmin = user?.role === "ADMIN";
    const firstName = user?.name?.split(" ")[0] || "Trader";

    // Platform-wide stats for Admin
    let totalPlatformOrders = 0;
    if (isAdmin) {
        const { count } = await supabaseAdmin
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'COMPLETED');
        totalPlatformOrders = count || 0;
    }

    // Fetch active cryptos
    const cryptos = await getCryptos(true);

    // Fetch active announcements
    const { data: rawAnnouncements = [] } = await getActiveAnnouncements();
    const announcements = (rawAnnouncements || []) as Announcement[];

    return (
        <div className="space-y-12 sm:space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Announcement Banner */}
            <AnnouncementBanner announcements={announcements} />

            {/* Header / Greeting */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">Platform Status : Online</span>
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none uppercase">
                        Welcome, <br />
                        <span className="text-gradient leading-relaxed">{firstName}.</span>
                    </h1>
                    <p className="text-xl text-foreground/50 font-medium max-w-2xl leading-relaxed">
                        {isAdmin
                            ? "Overview of platform health and management."
                            : "Your central hub for fast crypto exchanges and account management."}
                    </p>
                </div>

                {!isAdmin && (
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Link href="/dashboard/exchange?type=buy" className="w-full sm:w-auto group relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[28px]" />
                            <div className="relative h-18 px-10 rounded-[28px] bg-primary text-white flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] font-black">
                                <ArrowDownLeft className="h-5 w-5" />
                                <span>Buy Crypto</span>
                            </div>
                        </Link>
                        <Link href="/dashboard/exchange?type=sell" className="w-full sm:w-auto group relative">
                            <div className="relative h-18 px-10 rounded-[28px] glass border border-white/5 flex items-center justify-center gap-4 hover:bg-white/5 hover:border-white/10 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] font-black overflow-hidden group">
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                <ArrowUpRight className="h-5 w-5 text-primary" />
                                <span>Sell Crypto</span>
                            </div>
                        </Link>
                    </div>
                )}
            </div>

            {/* KYC Alert - Hidden for Admins */}
            {!isAdmin && kycStatus !== 'APPROVED' && (
                <div className={cn(
                    "relative overflow-hidden p-8 sm:p-12 rounded-[48px] border-2 group transition-all duration-700",
                    kycStatus === 'REJECTED' ? 'border-red-500/20 bg-red-500/5' : 'border-amber-500/20 bg-amber-500/5'
                )}>
                    {/* Background Atmosphere */}
                    <div className={cn(
                        "absolute -top-20 -right-20 h-64 w-64 blur-[100px] opacity-20 transition-all duration-1000 group-hover:scale-110",
                        kycStatus === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'
                    )} />

                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center gap-10">
                        <div className={cn(
                            "h-20 w-20 rounded-[32px] flex items-center justify-center shrink-0 border-2 transition-transform duration-700 group-hover:rotate-6 shadow-2xl",
                            kycStatus === 'REJECTED' ? 'bg-red-500/20 border-red-500/30' : 'bg-amber-500/20 border-amber-500/30'
                        )}>
                            <ShieldAlert className={cn("h-10 w-10", kycStatus === 'REJECTED' ? 'text-red-500' : 'text-amber-500')} />
                        </div>
                        <div className="flex-1 space-y-3">
                            <h3 className={cn(
                                "text-3xl font-black tracking-tight uppercase leading-none",
                                kycStatus === 'REJECTED' ? 'text-red-500' : 'text-amber-500'
                            )}>
                                {kycStatus === 'PENDING' ? 'Identity Under Review' :
                                    kycStatus === 'REJECTED' ? 'Identity Check Failed' :
                                        'Verification Required'}
                            </h3>
                            <p className="text-lg text-foreground/60 font-medium leading-relaxed max-w-4xl">
                                {kycStatus === 'PENDING' ? 'Your identity documents have been submitted and are under review. This usually takes 24-48 hours.' :
                                    kycStatus === 'REJECTED' ? 'Your verification was not successful. Please review the requirements and submit again.' :
                                        'To start trading and enable all features, please complete your account verification.'}
                            </p>
                        </div>
                        <Link
                            href="/dashboard/settings?tab=verification"
                            className={cn(
                                "h-18 px-12 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all active:scale-95 group/btn",
                                kycStatus === 'REJECTED' ? 'bg-red-500 text-white shadow-2xl shadow-red-500/30' :
                                    kycStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-2 border-amber-500/20 cursor-default pointer-events-none' :
                                        'bg-amber-500 text-black shadow-2xl shadow-amber-500/30'
                            )}
                        >
                            {kycStatus === 'PENDING' ? 'Under Review' :
                                kycStatus === 'REJECTED' ? 'Try Again' :
                                    'Verify Identity'}
                            {kycStatus !== 'PENDING' && <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />}
                        </Link>
                    </div>
                </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                <div className="glass-card group p-10 rounded-[48px] border border-white/5 space-y-10 relative overflow-hidden transition-all duration-500 hover:border-white/10">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="flex justify-between items-start">
                        <div className="h-16 w-16 rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
                            <RefreshCcw className="h-8 w-8 text-primary" />
                        </div>
                        <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">
                            {isAdmin ? "Platform Transactions" : "Recent Trades"}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-6xl font-black tracking-tighter">{isAdmin ? totalPlatformOrders : (orders?.length || 0)}</p>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">
                            {isAdmin ? "Trades Successfully Completed" : "Recent Orders Processed"}
                        </p>
                    </div>
                </div>

                <div className="glass-card group p-10 rounded-[48px] border border-white/5 space-y-10 relative overflow-hidden transition-all duration-500 hover:border-white/10">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="flex justify-between items-start">
                        <div className={cn(
                            "h-16 w-16 rounded-[24px] flex items-center justify-center border transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110 shadow-2xl",
                            isAdmin ? "bg-emerald-500/10 border-emerald-500/20" :
                                (kycStatus === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                    kycStatus === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20' :
                                        kycStatus === 'REJECTED' ? 'bg-red-500/10 border-red-500/20' :
                                            'bg-primary/10 border-primary/20')
                        )}>
                            {isAdmin ? <ShieldCheck className="h-8 w-8 text-emerald-500" /> : (kycStatus === 'APPROVED' ? <CheckCircle2 className="h-8 w-8 text-emerald-500" /> :
                                kycStatus === 'PENDING' ? <Activity className="h-8 w-8 text-amber-500" /> :
                                    kycStatus === 'REJECTED' ? <AlertCircle className="h-8 w-8 text-red-500" /> :
                                        <Sparkles className="h-8 w-8 text-primary" />
                            )}
                        </div>
                        <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">
                            {isAdmin ? "Control Level" : "Account Status"}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className={cn(
                            "text-4xl font-black tracking-tight uppercase",
                            isAdmin ? "text-emerald-500" : (kycStatus === 'APPROVED' ? 'text-emerald-500' :
                                kycStatus === 'PENDING' ? 'text-amber-500' :
                                    kycStatus === 'REJECTED' ? 'text-red-500' : 'text-foreground')
                        )}>
                            {isAdmin ? "Platform Admin" : (kycStatus === 'APPROVED' ? 'Fully Verified' : kycStatus === 'UNSUBMITTED' ? 'Standard Account' : kycStatus)}
                        </p>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em]">
                            {isAdmin ? "Complete control over platform" : "Identity Verification Status"}
                        </p>
                    </div>
                </div>

                <div className="glass-card group p-10 rounded-[48px] border border-white/5 space-y-10 relative overflow-hidden transition-all duration-500 hover:border-white/10">
                    <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="flex justify-between items-start">
                        <div className="h-16 w-16 rounded-[24px] bg-secondary/10 border border-secondary/20 flex items-center justify-center transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110 shadow-2xl shadow-secondary/10">
                            <Globe className="h-8 w-8 text-secondary" />
                        </div>
                        <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Market Feed</span>
                    </div>
                    <div className="space-y-4">
                        <p className="text-4xl font-black tracking-tight uppercase">Live Rates</p>
                        <Link href="/#market" className="group/link inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-secondary hover:text-secondary/80 transition-colors">
                            View Price Indexes <ExternalLink className="h-3 w-3 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-20">
                {/* Tradeable Assets - Dynamic */}
                <div className="lg:col-span-8">
                    <TradeableAssets initialData={cryptos} />
                </div>

                {/* Support / Management Sidebar */}
                <div className="lg:col-span-4 space-y-12">
                    {!isAdmin && (
                        <div className="glass-card p-10 rounded-[48px] border border-white/5 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em]">Recent Help</h3>
                                <Link href="/dashboard/support" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors">
                                    View All
                                </Link>
                            </div>

                            {recentTickets && recentTickets.length > 0 ? (
                                <div className="space-y-4">
                                    {recentTickets.map((ticket: { id: string; ticket_id: string; status: string; subject: string }) => (
                                        <Link
                                            key={ticket.id}
                                            href={`/dashboard/support/${ticket.ticket_id}`}
                                            className="block p-5 rounded-[32px] bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/10 transition-all group"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] font-black text-foreground/30 tracking-[0.2em]">#{ticket.ticket_id}</span>
                                                <div className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                    ticket.status === 'OPEN' ? 'bg-primary/10 text-primary border-primary/20' :
                                                        ticket.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                            'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                )}>
                                                    {ticket.status}
                                                </div>
                                            </div>
                                            <p className="text-sm font-black truncate group-hover:text-primary transition-colors uppercase tracking-tight">
                                                {ticket.subject}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[40px] space-y-4">
                                    <MessageSquare className="h-10 w-10 text-foreground/10 mx-auto" />
                                    <p className="text-[10px] text-foreground/20 font-black uppercase tracking-[0.3em]">No tickets found</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="glass-card p-10 rounded-[48px] border border-white/5 space-y-10">
                        <h3 className="text-sm font-black uppercase tracking-[0.3em]">{isAdmin ? "Admin Controls" : "Quick Links"}</h3>
                        <div className="space-y-4">
                            {!isAdmin ? (
                                [
                                    { name: "Trade History", href: "/dashboard/orders" },
                                    { name: "Identity Status", href: "/dashboard/settings?tab=verification" },
                                    { name: "Help Center", href: "/dashboard/support" }
                                ].map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center justify-between p-6 rounded-[32px] bg-white/5 border border-white/5 font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 hover:border-primary/20 transition-all group"
                                    >
                                        {link.name} <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                    </Link>
                                ))
                            ) : (
                                [
                                    { name: "Identity Checks", href: "/admin/kyc" },
                                    { name: "Global Transactions", href: "/admin/orders" },
                                    { name: "Member List", href: "/admin/users" }
                                ].map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center justify-between p-6 rounded-[32px] bg-white/5 border border-white/5 font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 hover:border-emerald-500/20 transition-all group"
                                    >
                                        {link.name} <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
