import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/kyc-storage";
import {
    Users,
    ShieldCheck,
    Package,
    ArrowUpRight,
    TrendingUp,
    AlertTriangle,
    ShieldAlert,
    ChevronRight,
    Search,
    Activity,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCryptos } from "@/actions/crypto";
import { CryptoIcon } from "@/components/CryptoIcon";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Platform Controls | CoinDarks",
    description: "Centrally manage members, transactions, and system status.",
};

export default async function AdminDashboardPage() {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    // Combined data fetching using supabaseAdmin
    const [
        { count: totalUsers },
        { count: pendingKYC },
        { count: totalOrders },
        { data: recentUsers },
        inventoryStats
    ] = await Promise.all([
        supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('kyc_submissions').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
        supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('users').select('id, first_name, last_name, email, created_at, kyc_status, profile_image').order('created_at', { ascending: false }).limit(5),
        getCryptos(false)
    ]);

    const stats = [
        { name: "Member Count", value: totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", link: "/admin/users", sub: "Total registered accounts" },
        { name: "Identity Verifications", value: pendingKYC || 0, icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", link: "/admin/kyc", sub: "Awaiting review" },
        { name: "Global Transactions", value: totalOrders || 0, icon: Package, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", link: "/admin/orders", sub: "All completed trades" },
    ];

    return (
        <div className="space-y-12 sm:space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header / Command Focus */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider sm:tracking-[0.4em] text-foreground/40">Secure Session : Administrator</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none uppercase">
                        Platform <br />
                        <span className="text-gradient leading-relaxed">Controls.</span>
                    </h1>
                    <p className="text-base sm:text-xl text-foreground/50 font-medium max-w-2xl leading-relaxed">
                        Centrally manage members, identity verifications, and global platform transactions across all regions.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <Link href="/admin/users" className="w-full sm:w-auto group relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-[28px]" />
                        <div className="relative h-14 sm:h-18 px-6 sm:px-10 rounded-2xl sm:rounded-[28px] bg-primary text-white flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 active:scale-95 transition-all text-[10px] sm:text-xs uppercase tracking-[0.2em] font-black">
                            <Search className="h-4 sm:h-5 w-4 sm:w-5" />
                            <span>Member List</span>
                        </div>
                    </Link>
                    <Link href="/admin/support" className="w-full sm:w-auto group relative">
                        <div className="relative h-14 sm:h-18 px-6 sm:px-10 rounded-2xl sm:rounded-[28px] glass border border-white/5 flex items-center justify-center gap-4 hover:bg-white/5 hover:border-white/10 active:scale-95 transition-all text-[10px] sm:text-xs uppercase tracking-[0.2em] font-black overflow-hidden group">
                            <Activity className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-500" />
                            <span>System Status</span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                {stats.map((stat) => (
                    <Link
                        key={stat.name}
                        href={stat.link}
                        className="glass-card group p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl md:rounded-[48px] border border-white/5 space-y-6 sm:space-y-10 relative overflow-hidden transition-all duration-500 hover:border-white/10"
                    >
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none", stat.bg)} />

                        <div className="flex justify-between items-start">
                            <div className={cn(
                                "h-16 w-16 rounded-[24px] border flex items-center justify-center transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110 shadow-2xl",
                                stat.bg,
                                stat.border
                            )}>
                                <stat.icon className={cn("h-8 w-8", stat.color)} />
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <ArrowUpRight className="h-5 w-5 text-foreground/40" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter tabular-nums leading-none">{stat.value}</p>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">{stat.name}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 leading-relaxed">{stat.sub}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-20">
                {/* Recent Users List */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase">
                                New <span className="text-gradient">Members.</span>
                            </h2>
                            <p className="text-xs text-foreground/40 font-black uppercase tracking-[0.2em]">Latest signups</p>
                        </div>
                        <Link href="/admin/users" className="group/link inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-primary hover:text-primary/70 transition-colors">
                            Member List <ArrowRight className="h-4 w-4 group-hover/link:translate-x-2 transition-transform" />
                        </Link>
                    </div>

                    <div className="glass-card rounded-2xl sm:rounded-3xl md:rounded-[48px] border border-white/5 overflow-hidden">
                        {(recentUsers && recentUsers.length > 0) ? (
                            <div className="divide-y divide-white/5">
                                {recentUsers.map((user) => (
                                    <Link
                                        key={user.id}
                                        href={`/admin/users/${user.id}`}
                                        className="group p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/2 transition-all duration-500 active:scale-[0.99]"
                                    >
                                        <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-0">
                                            <div className="relative">
                                                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl sm:rounded-[24px] overflow-hidden border-2 border-white/5 group-hover:border-primary/30 transition-all duration-500 shadow-2xl">
                                                    {user.profile_image ? (
                                                        <Image
                                                            src={user.profile_image}
                                                            alt={`${user.first_name} ${user.last_name}`}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-primary flex items-center justify-center text-white font-black text-xl">
                                                            {user.first_name?.[0]}{user.last_name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={cn(
                                                    "absolute -bottom-1 -right-1 h-5 w-5 rounded-lg border-2 border-background flex items-center justify-center shadow-lg",
                                                    user.kyc_status === 'APPROVED' ? "bg-emerald-500" :
                                                        user.kyc_status === 'PENDING' ? "bg-amber-500" :
                                                            "bg-foreground/20"
                                                )}>
                                                    {user.kyc_status === 'APPROVED' ? <ShieldCheck className="h-3 w-3 text-white" /> :
                                                        user.kyc_status === 'PENDING' ? <Activity className="h-3 w-3 text-white" /> :
                                                            <div className="h-1 w-1 rounded-full bg-white/40" />
                                                    }
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-lg tracking-tight group-hover:text-primary transition-colors truncate">
                                                        {user.first_name} {user.last_name}
                                                    </p>
                                                    {user.kyc_status === 'APPROVED' && (
                                                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                    <p className="text-[10px] text-foreground/30 font-black tracking-widest uppercase truncate max-w-[200px] sm:max-w-none">
                                                        {user.email}
                                                    </p>
                                                    <div className="hidden sm:block h-1 w-1 rounded-full bg-white/10" />
                                                    <p className="text-[10px] text-foreground/20 font-black tabular-nums tracking-widest uppercase shrink-0">
                                                        {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 ml-auto sm:ml-0">
                                            <div className={cn(
                                                "px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500",
                                                user.kyc_status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500/20" :
                                                    user.kyc_status === 'PENDING' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 group-hover:bg-amber-500/20" :
                                                        "bg-white/5 text-foreground/20 border-white/5"
                                            )}>
                                                {user.kyc_status === 'UNSUBMITTED' ? 'No Documents' : user.kyc_status}
                                            </div>
                                            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-2">
                                                <ChevronRight className="h-5 w-5 text-foreground/30" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 text-center space-y-4">
                                <div className="h-20 w-20 rounded-[32px] bg-white/5 flex items-center justify-center mx-auto border border-white/5">
                                    <Users className="h-10 w-10 text-white/10" />
                                </div>
                                <p className="text-[10px] text-foreground/20 font-black uppercase tracking-[0.4em]">No Users Found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Status Sidebar */}
                <div className="lg:col-span-4 space-y-12">
                    <div className="space-y-8">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black tracking-tight uppercase">System <span className="text-gradient">Health.</span></h2>
                            <p className="text-xs text-foreground/40 font-black uppercase tracking-[0.2em]">Asset Reserves</p>
                        </div>

                        <div className="glass-card p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl md:rounded-[48px] border border-white/5 space-y-8 sm:space-y-10">
                            <div className="space-y-6">
                                {(inventoryStats || []).map((asset) => (
                                    <div key={asset.id} className="flex items-center justify-between group/asset">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 transition-transform duration-500 group-hover/asset:scale-110 group-hover/asset:rotate-6">
                                                <CryptoIcon
                                                    symbol={asset.symbol}
                                                    iconUrl={asset.icon_url}
                                                    className="p-2"
                                                />
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="font-black text-sm tracking-tight uppercase">{asset.symbol}</span>
                                                <p className="text-[10px] text-foreground/20 font-black uppercase tracking-widest">{asset.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full",
                                                asset.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-red-500"
                                            )} />
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-[0.2em]",
                                                asset.is_active ? "text-emerald-500" : "text-red-500"
                                            )}>
                                                {asset.is_active ? "Online" : "Offline"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link href="/admin/inventory" className="group/btn relative block overflow-hidden rounded-[24px]">
                                <div className="absolute inset-0 bg-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                                <div className="relative h-16 w-full flex items-center justify-center border-2 border-white/10 font-black text-[10px] uppercase tracking-[0.3em] group-hover/btn:text-white transition-colors duration-500 gap-3">
                                    Manage Reserves <TrendingUp className="h-4 w-4 text-primary group-hover/btn:text-white transition-colors" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {(pendingKYC ?? 0) > 0 && (
                        <div className="relative overflow-hidden p-6 sm:p-8 rounded-2xl sm:rounded-3xl md:rounded-[40px] bg-red-500/5 border-2 border-red-500/20 group transition-all duration-500 hover:border-red-500/40">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                                <AlertTriangle className="h-20 w-20 text-red-500" />
                            </div>
                            <div className="relative z-10 flex items-start gap-5">
                                <div className="h-12 w-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                                    <ShieldAlert className="h-6 w-6 text-red-500" />
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] text-center">Security Alert</p>
                                        <p className="text-sm text-foreground/50 font-medium leading-relaxed">
                                            <span className="text-foreground font-black">{pendingKYC} ID Submissions</span> are awaiting review.
                                        </p>
                                    </div>
                                    <Link href="/admin/kyc" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 hover:text-red-400 transition-colors">
                                        Open Checks <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
