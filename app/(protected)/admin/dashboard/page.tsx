import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
    ShieldAlert,
    TrendingUp,
    Activity,
    UserPlus,
    CheckCircle2,
    XCircle,
    ArrowRight,
    DollarSign,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
    const session = await auth();
    const role = session?.user?.role;

    if (role === "USER" || !role) {
        redirect("/dashboard");
    }

    const isAdmin = role === "ADMIN";
    const isSupport = role === "SUPPORT" || isAdmin;
    const isFinance = role === "FINANCE" || isAdmin;

    const allStats = [
        {
            label: "Pending KYC",
            value: "24",
            icon: ShieldAlert,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            trend: "8 high priority",
            show: isSupport
        },
        {
            label: "KYC Success Rate",
            value: "94.2%",
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-500/10",
            trend: "+2% this week",
            show: isSupport
        },
        {
            label: "Total Volume",
            value: "$42,500",
            icon: TrendingUp,
            color: "text-green-500",
            bg: "bg-green-500/10",
            trend: "+8.2% vs last week",
            show: isFinance
        },
        {
            label: "Active Payouts",
            value: "8",
            icon: Activity,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            trend: "$2,400 total",
            show: isFinance
        },
        {
            label: "System Health",
            value: "99.9%",
            icon: ShieldCheck,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            trend: "All systems go",
            show: isAdmin
        },
    ];

    const stats = allStats.filter(s => s.show);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Admin Header */}
            <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">
                    {isAdmin ? "System Overview" : isFinance ? "Treasury Overview" : "Compliance Overview"}
                </h1>
                <p className="text-foreground/40 font-medium uppercase tracking-[0.2em] text-[10px]">
                    {isAdmin ? "Administrative Control Panel" : isFinance ? "Financial Operations" : "Support & Compliance"} • Real-time Monitoring
                </p>
            </div>

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass-morphism p-6 rounded-3xl border border-white/5 group hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-3 rounded-2xl", stat.bg)}>
                                <stat.icon className={cn("h-6 w-6", stat.color)} />
                            </div>
                            <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">Global</span>
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

            {/* Actions & Recent Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Role Specific Section */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Support: KYC Queue */}
                    {isSupport && (
                        <div className="glass-morphism rounded-3xl p-8 border border-white/5">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold">Compliance Verification Queue</h3>
                                    <p className="text-xs text-foreground/40 font-medium uppercase tracking-wider mt-1">Pending Identity Checks</p>
                                </div>
                                <button className="text-xs font-bold text-primary flex items-center gap-2 group">
                                    View Queue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { name: "Kwame Mensah", email: "kwame@example.com", time: "2 hours ago", status: "Level 1", risk: "Low" },
                                    { name: "John Doe", email: "john@example.com", time: "5 hours ago", status: "Level 2", risk: "Medium" },
                                    { name: "Sarah Smith", email: "sarah@example.com", time: "Yesterday", status: "Level 1", risk: "Low" }
                                ].map((user, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-foreground/5 border border-white/5 hover:bg-foreground/10 transition-all gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{user.name}</p>
                                                <p className="text-xs text-foreground/40">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs font-bold uppercase tracking-widest text-primary/60">{user.status} • Risk: {user.risk}</p>
                                                <p className="text-[10px] text-foreground/20 font-medium">{user.time}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </button>
                                                <button className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                    <XCircle className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Finance: Recent Activity Flow */}
                    {isFinance && (
                        <div className="glass-morphism rounded-3xl p-8 border border-white/5">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold">Treasury Flow</h3>
                                    <p className="text-xs text-foreground/40 font-medium uppercase tracking-wider mt-1">Live Deposit/Payout Stream</p>
                                </div>
                                <button className="text-xs font-bold text-secondary flex items-center gap-2 group">
                                    Ledger <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { type: "PAYOUT", amount: "$450.00", user: "Kwame M.", status: "PROCESSING" },
                                    { type: "DEPOSIT", amount: "$1,200.00", user: "John D.", status: "COMPLETED" },
                                    { type: "PAYOUT", amount: "$80.00", user: "Sarah S.", status: "AWAITING" }
                                ].map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-foreground/5 border border-white/5 hover:bg-foreground/10 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-xl",
                                                tx.type === "DEPOSIT" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                                            )}>
                                                {tx.type === "DEPOSIT" ? <TrendingUp className="h-4 w-4" /> : <ArrowRight className="h-4 w-4 -rotate-45" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{tx.type} - {tx.user}</p>
                                                <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">{tx.status}</p>
                                            </div>
                                        </div>
                                        <p className={cn("font-black", tx.type === "DEPOSIT" ? "text-green-500" : "text-foreground")}>
                                            {tx.type === "DEPOSIT" ? "+" : "-"}{tx.amount}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions & System Info */}
                <div className="space-y-6">
                    <div className="glass-morphism rounded-3xl p-8 border border-white/5">
                        <h3 className="text-xl font-bold mb-6">Operations</h3>
                        <div className="space-y-4">
                            {isSupport && (
                                <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/5 hover:bg-primary hover:text-white transition-all group">
                                    <div className="flex items-center gap-3">
                                        <UserPlus className="h-5 w-5" />
                                        <span className="text-sm font-bold">New Support Case</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            )}
                            {isFinance && (
                                <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/5 hover:bg-secondary hover:text-white transition-all group">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="h-5 w-5" />
                                        <span className="text-sm font-bold">Adjust Rates</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            )}
                            {isAdmin && (
                                <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/5 hover:bg-foreground hover:text-background transition-all group">
                                    <div className="flex items-center gap-3">
                                        <ShieldAlert className="h-5 w-5" />
                                        <span className="text-sm font-bold">Security Scan</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="glass-morphism rounded-3xl p-6 border border-white/5">
                        <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
                            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Activity className="h-3 w-3" /> System Health
                            </h4>
                            <p className="text-sm font-medium leading-relaxed">All relay nodes are active. Latency: 42ms.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin-only Audit Logs or System Settings */}
            {isAdmin && (
                <div className="glass-morphism rounded-3xl p-8 border border-white/5 animate-in fade-in duration-1000">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold">Security Audit Logs</h3>
                            <p className="text-xs text-foreground/40 font-medium uppercase tracking-wider mt-1">Staff & Infrastructure Activity</p>
                        </div>
                        <button className="px-4 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-xs font-bold transition-all">Export Logs</button>
                    </div>

                    <div className="space-y-3">
                        {[
                            { action: "Role Updated", user: "support@coindarks.com", details: "Changed user 'Ebube O.' to Verified", time: "1 hour ago" },
                            { action: "Withdrawal Approved", user: "finance@coindarks.com", details: "Approved payout of $450.00", time: "3 hours ago" },
                            { action: "System Config", user: "admin@coindarks.com", details: "Updated GHS exchange rate to 15.20", time: "5 hours ago" }
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div>
                                    <p className="text-sm font-bold flex items-center gap-2">
                                        <span className="text-primary">{log.action}:</span> {log.details}
                                    </p>
                                    <p className="text-[10px] text-foreground/40 mt-0.5">{log.user} • {log.time}</p>
                                </div>
                                <div className="h-6 w-px bg-white/5 mx-4" />
                                <span className="text-[9px] font-bold text-foreground/20 uppercase tracking-widest whitespace-nowrap">Source: Web Console</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
