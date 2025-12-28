import { auth } from "@/auth";
import {
    History,
    Wallet,
    LayoutDashboard,
    Settings,
    ArrowUpRight,
    ArrowDownLeft,
    Zap,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
    const session = await auth();

    // Stats data
    const stats = [
        {
            label: "Active Orders",
            value: "3",
            subValue: "+1 in last 24h",
            icon: History,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            label: "Total Volume",
            value: "$450.00",
            subValue: "5 transactions",
            icon: Wallet,
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        {
            label: "KYC Status",
            value: "Approved",
            subValue: "Level 1 Verified",
            icon: LayoutDashboard,
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Section */}
            <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">
                    Welcome back, <span className="text-gradient">{session?.user?.name?.split(' ')[0] || "Trader"}</span>!
                </h1>
                <p className="text-foreground/40 font-medium">
                    Here&apos;s a quick overview of your crypto activity today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass-morphism p-6 rounded-3xl border border-white/5 group hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110", stat.bg)}>
                                <stat.icon className={cn("h-6 w-6", stat.color)} />
                            </div>
                            <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">Live Metrics</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground/40 mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3>
                            <p className="text-xs text-foreground/20 font-bold mt-2 flex items-center gap-1">
                                <Zap className="h-3 w-3 text-primary" />
                                {stat.subValue}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 glass-morphism rounded-3xl p-8 border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold">Recent Activity</h3>
                            <p className="text-xs text-foreground/40 font-medium uppercase tracking-wider mt-1">Transaction History</p>
                        </div>
                        <button className="text-xs font-bold text-primary hover:underline transition-all">View All</button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { type: "buy", asset: "BTC", amount: "+$250.00", date: "Oct 12, 10:45 AM", status: "Completed" },
                            { type: "sell", asset: "ETH", amount: "-$120.00", date: "Oct 11, 04:20 PM", status: "Processing" },
                            { type: "buy", asset: "USDT", amount: "+$500.00", date: "Oct 10, 09:12 AM", status: "Completed" }
                        ].map((activity, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-foreground/5 border border-white/5 hover:bg-foreground/10 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12",
                                        activity.type === "buy" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                    )}>
                                        {activity.type === "buy" ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Exchange {activity.asset} → GHS</p>
                                        <p className="text-xs text-foreground/40 font-medium lowercase tracking-wide">{activity.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={cn("text-sm font-black", activity.type === "buy" ? "text-green-500" : "text-foreground")}>
                                        {activity.amount}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">{activity.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account Status / Actions */}
                <div className="space-y-8">
                    {/* KYC Quick Action */}
                    <div className="glass-morphism rounded-3xl p-8 border border-white/5 bg-primary/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                            <ShieldCheck className="h-24 w-24 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Verification Centre</h3>
                        <p className="text-foreground/60 mb-8 text-sm leading-relaxed">
                            Upgrade your security and increase your daily limits by completing KYC.
                        </p>
                        <button className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                            Start Verification
                        </button>
                    </div>

                    {/* Support Card */}
                    <div className="glass-morphism rounded-3xl p-8 border border-white/5 text-center">
                        <div className="h-16 w-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                            <Settings className="h-8 w-8 text-secondary" />
                        </div>
                        <h4 className="font-bold mb-2">Need Help?</h4>
                        <p className="text-xs text-foreground/40 mb-6">Our support team is available 24/7 for you.</p>
                        <button className="w-full py-3 rounded-xl border border-white/10 text-xs font-bold hover:bg-foreground/5 transition-all">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
