import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
    TrendingUp,
    Wallet,
    DollarSign,
    RefreshCcw,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function FinanceManagementPage() {
    const session = await auth();
    const role = session?.user?.role;

    if (role !== "ADMIN" && role !== "FINANCE") {
        redirect("/dashboard");
    }

    const financeStats = [
        { label: "Treasury Depth", value: "$342,800", icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+$12.4k today" },
        { label: "Operational Float", value: "$12,300", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", trend: "Stable" },
        { label: "Pending Payouts", value: "8", icon: RefreshCcw, color: "text-amber-500", bg: "bg-amber-500/10", trend: "$2,400 total" },
        { label: "Reserve Ratio", value: "1.42x", icon: DollarSign, color: "text-purple-500", bg: "bg-purple-500/10", trend: "Above Target" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">
                        Finance <span className="text-gradient">Operations</span>
                    </h1>
                    <p className="text-foreground/40 font-medium uppercase tracking-[0.2em] text-[10px]">
                        Treasury Management • Transaction Monitoring
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="glass-morphism px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-foreground/60">GHS / USDT: 15.20</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {financeStats.map((stat) => (
                    <div key={stat.label} className="glass-morphism p-6 rounded-3xl border border-white/5 group hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-3 rounded-2xl", stat.bg)}>
                                <stat.icon className={cn("h-6 w-6", stat.color)} />
                            </div>
                            <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">Real-time</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground/40 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black">{stat.value}</h3>
                            <p className="text-[10px] text-foreground/20 font-bold mt-2 uppercase tracking-wide">
                                {stat.trend}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Exchange Rate & Payout Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rate Manager */}
                <div className="glass-morphism rounded-3xl p-8 border border-white/5 space-y-6">
                    <h3 className="text-xl font-bold">Rate Management</h3>
                    <div className="space-y-4">
                        {[
                            { pair: "GHS / USDT", current: "15.20", dynamic: "1.2%" },
                            { pair: "NGN / USDT", current: "1,450.00", dynamic: "0.8%" },
                            { pair: "KES / USDT", current: "128.50", dynamic: "1.5%" }
                        ].map((rate) => (
                            <div key={rate.pair} className="p-4 rounded-2xl bg-foreground/5 border border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{rate.pair}</span>
                                    <span className="text-[10px] font-bold text-green-500">+{rate.dynamic}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-black">{rate.current}</span>
                                    <button className="text-[10px] font-bold text-primary hover:underline">Update</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Payout Queue */}
                <div className="lg:col-span-2 glass-morphism rounded-3xl p-8 border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold">Treasury Payout Queue</h3>
                            <p className="text-xs text-foreground/40 font-medium uppercase tracking-wider mt-1">Pending Approval Flow</p>
                        </div>
                        <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
                            Approve Batch
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { user: "Kwame M.", amount: "GHS 5,200", method: "Momo", time: "Just now", status: "PENDING" },
                            { user: "John D.", amount: "$1,200", method: "USDT-TRC20", time: "15 mins ago", status: "VERIFIED" },
                            { user: "Sarah S.", amount: "GHS 850", method: "Momo", time: "45 mins ago", status: "PENDING" }
                        ].map((tx, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-foreground/5 border border-white/5 hover:bg-foreground/10 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                                        {tx.user[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{tx.user} • {tx.method}</p>
                                        <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">{tx.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-sm font-black text-foreground">{tx.amount}</p>
                                        <span className={cn(
                                            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest",
                                            tx.status === "VERIFIED" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                                        )}>{tx.status}</span>
                                    </div>
                                    <button className="p-2 rounded-xl bg-foreground/5 hover:bg-green-500 hover:text-white transition-all">
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
