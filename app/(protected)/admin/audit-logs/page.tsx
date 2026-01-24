import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/kyc-storage";
import { History, User, Wallet, CreditCard, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AuditLogsPage({
    searchParams
}: {
    searchParams: Promise<{ entity?: string; action?: string }>
}) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/dashboard");

    const params = await searchParams;

    // Build query
    let query = supabaseAdmin
        .from('audit_logs')
        .select(`
            *,
            users (
                first_name,
                last_name,
                email
            )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

    // Apply filters
    if (params.entity) {
        query = query.eq('entity_type', params.entity);
    }
    if (params.action) {
        query = query.eq('action_type', params.action);
    }

    const { data: logs } = await query;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Audit Logs</h1>
                <p className="text-foreground/50 font-medium">
                    Track all wallet and payment method changes across the platform.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Link
                    href="/admin/audit-logs"
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${!params.entity && !params.action
                            ? 'bg-primary text-white'
                            : 'bg-white/5 text-foreground/60 hover:bg-white/10'
                        }`}
                >
                    All Logs
                </Link>
                <Link
                    href="/admin/audit-logs?entity=WALLET"
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${params.entity === 'WALLET'
                            ? 'bg-primary text-white'
                            : 'bg-white/5 text-foreground/60 hover:bg-white/10'
                        }`}
                >
                    Crypto Wallets
                </Link>
                <Link
                    href="/admin/audit-logs?entity=PAYMENT_METHOD"
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${params.entity === 'PAYMENT_METHOD'
                            ? 'bg-primary text-white'
                            : 'bg-white/5 text-foreground/60 hover:bg-white/10'
                        }`}
                >
                    Fiat Accounts
                </Link>
                <div className="h-8 w-px bg-white/10" />
                <Link
                    href="/admin/audit-logs?action=CREATE"
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${params.action === 'CREATE'
                            ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20'
                            : 'bg-white/5 text-foreground/60 hover:bg-white/10'
                        }`}
                >
                    Created
                </Link>
                <Link
                    href="/admin/audit-logs?action=UPDATE"
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${params.action === 'UPDATE'
                            ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20'
                            : 'bg-white/5 text-foreground/60 hover:bg-white/10'
                        }`}
                >
                    Updated
                </Link>
                <Link
                    href="/admin/audit-logs?action=DELETE"
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${params.action === 'DELETE'
                            ? 'bg-rose-500/20 text-rose-500 border border-rose-500/20'
                            : 'bg-white/5 text-foreground/60 hover:bg-white/10'
                        }`}
                >
                    Deleted
                </Link>
            </div>

            {/* Logs List */}
            {!logs || logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-4 rounded-[32px] border border-dashed border-white/10 bg-white/2">
                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-6 text-foreground/20">
                        <History className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No Audit Logs</h3>
                    <p className="text-foreground/40 text-center max-w-sm font-medium">
                        No changes have been recorded yet. Audit logs will appear here when users modify their wallets or payment methods.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {logs.map((log: any) => (
                        <Link
                            key={log.id}
                            href={`/admin/audit-logs/${log.id}`}
                            className="block p-6 rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md hover:border-white/10 transition-all cursor-pointer hover:scale-[1.01]"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border ${log.entity_type === 'WALLET'
                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                        : 'bg-purple-500/10 border-purple-500/20 text-purple-500'
                                        }`}>
                                        {log.entity_type === 'WALLET' ? <Wallet className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-base font-black">
                                                {log.entity_type === 'WALLET' ? 'Crypto Wallet' : 'Fiat Account'}
                                            </h3>
                                            <Badge variant="secondary" className={`text-[9px] font-black uppercase tracking-widest ${log.action_type === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                log.action_type === 'UPDATE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}>
                                                {log.action_type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-foreground/60 mb-3">
                                            <User className="h-4 w-4" />
                                            <span className="font-medium">
                                                {log.users?.first_name} {log.users?.last_name}
                                            </span>
                                            <span className="text-foreground/30">•</span>
                                            <span className="text-xs">{log.users?.email}</span>
                                        </div>
                                        <div className="text-xs text-foreground/40 font-medium">
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Show changes */}
                                {log.action_type === 'UPDATE' && log.old_value && log.new_value && (
                                    <div className="flex items-center gap-3 text-xs">
                                        <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                                            <p className="text-[10px] text-rose-500/60 font-bold uppercase tracking-widest mb-1">Old</p>
                                            <code className="text-foreground/60 font-mono text-[10px]">
                                                {JSON.stringify(log.old_value, null, 2).substring(0, 100)}...
                                            </code>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-foreground/20" />
                                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                            <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest mb-1">New</p>
                                            <code className="text-foreground/60 font-mono text-[10px]">
                                                {JSON.stringify(log.new_value, null, 2).substring(0, 100)}...
                                            </code>
                                        </div>
                                    </div>
                                )}
                                {log.action_type === 'DELETE' && log.old_value && (
                                    <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs">
                                        <p className="text-[10px] text-rose-500/60 font-bold uppercase tracking-widest mb-1">Deleted</p>
                                        <code className="text-foreground/60 font-mono text-[10px]">
                                            {JSON.stringify(log.old_value, null, 2).substring(0, 100)}...
                                        </code>
                                    </div>
                                )}
                                {log.action_type === 'CREATE' && log.new_value && (
                                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs">
                                        <p className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest mb-1">Created</p>
                                        <code className="text-foreground/60 font-mono text-[10px]">
                                            {JSON.stringify(log.new_value, null, 2).substring(0, 100)}...
                                        </code>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
