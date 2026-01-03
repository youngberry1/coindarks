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
    AlertTriangle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCryptos } from "@/actions/crypto";
import { CryptoIcon } from "@/components/CryptoIcon";

export const metadata: Metadata = {
    title: "Admin Hub | CoinDarks",
    description: "Platform oversight and management dashboard.",
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
        { name: "Total Users", value: totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", link: "/admin/users" },
        { name: "Pending KYC", value: pendingKYC || 0, icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10", link: "/admin/kyc" },
        { name: "Total Orders", value: totalOrders || 0, icon: Package, color: "text-emerald-500", bg: "bg-emerald-500/10", link: "/admin/orders" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Platform Hub</h1>
                <p className="text-foreground/50 font-medium">Real-time status of your financial ecosystem.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Link key={stat.name} href={stat.link} className="group p-8 rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md hover:bg-white/5 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`h-14 w-14 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`h-7 w-7 ${stat.color}`} />
                            </div>
                            <ArrowUpRight className="h-5 w-5 text-foreground/20 group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-4xl font-black mb-1">{stat.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{stat.name}</p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Recent Users List */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black uppercase tracking-widest">Recent Onboarding</h2>
                        <Link href="/admin/users" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">View All Users</Link>
                    </div>

                    <div className="rounded-[40px] border border-white/5 bg-card-bg/30 overflow-hidden">
                        {(recentUsers || []).map((user, idx) => (
                            <div key={user.id} className={`p-6 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 ${idx === recentUsers!.length - 1 ? "border-b-0" : ""}`}>
                                <div className="flex items-center gap-4">
                                    {user.profile_image ? (
                                        <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/5 relative">
                                            <Image
                                                src={user.profile_image}
                                                alt={`${user.first_name} ${user.last_name}`}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            {user.first_name?.[0]}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold">{user.first_name} {user.last_name}</p>
                                        <p className="text-[10px] text-foreground/40 font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${user.kyc_status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" :
                                        user.kyc_status === 'PENDING' ? "bg-amber-500/10 text-amber-500 border-amber-500/10" :
                                            "bg-white/5 text-foreground/40 border-white/5"
                                        }`}>
                                        {user.kyc_status}
                                    </div>
                                    <p className="text-[10px] font-bold text-foreground/20 tabular-nums">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Status Sidebar */}
                <div className="xl:col-span-4 space-y-6">
                    <h2 className="text-xl font-black uppercase tracking-widest">Asset Status</h2>
                    <div className="p-8 rounded-[40px] border border-white/5 bg-card-bg/50 backdrop-blur-md space-y-8">
                        {(inventoryStats || []).map((asset) => (
                            <div key={asset.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full overflow-hidden bg-white/5 flex items-center justify-center font-black text-xs text-primary relative">
                                        <CryptoIcon
                                            symbol={asset.symbol}
                                            iconUrl={asset.icon_url}
                                            className="object-cover"
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center -z-10">{asset.symbol[0]}</span>
                                    </div>
                                    <span className="font-bold">{asset.symbol}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${asset.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${asset.is_active ? "text-emerald-500" : "text-red-500"}`}>
                                        {asset.is_active ? "Active" : "Disabled"}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <Link href="/admin/inventory" className="flex items-center justify-center w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                            Manage Inventory <TrendingUp className="ml-2 h-4 w-4 text-primary" />
                        </Link>
                    </div>

                    <div className="p-6 rounded-[32px] bg-red-500/5 border border-red-500/10 flex items-start gap-4">
                        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                        <div>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Attention Required</p>
                            <p className="text-xs text-foreground/40 font-medium leading-relaxed">
                                {pendingKYC || 0} users are waiting for identity verification. Process these to maintain compliance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
