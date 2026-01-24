import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/kyc-storage";
import Image from "next/image";
import { ArrowLeft, User, Database, FileJson, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function AuditLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/dashboard");

    const { id } = await params;

    // Fetch audit log with user details
    const { data: log, error } = await supabaseAdmin
        .from('audit_logs')
        .select(`
            *,
            users (
                first_name,
                last_name,
                email,
                profile_image
            )
        `)
        .eq('id', id)
        .single();

    if (error || !log) {
        return notFound();
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
            {/* Header */}
            <div>
                <Link
                    href="/admin/audit-logs"
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-colors mb-8 group"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Audit Logs
                </Link>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`h-2 w-2 rounded-full ${log.action_type === 'CREATE' ? 'bg-emerald-500' :
                                log.action_type === 'UPDATE' ? 'bg-amber-500' :
                                    'bg-rose-500'
                                } animate-pulse`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">
                                {log.action_type} {log.entity_type}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">Audit Log Details</h1>
                        <p className="text-foreground/50 font-medium">
                            Recorded on {new Date(log.created_at).toLocaleString()}
                        </p>
                    </div>

                    <Badge variant="secondary" className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest ${log.action_type === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        log.action_type === 'UPDATE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-500 border-rose-500/20'
                        }`}>
                        {log.action_type}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User Information */}
                <div className="p-8 rounded-[32px] bg-card/50 border border-white/5 space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                        <User className="h-4 w-4" /> User Information
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary/40 border border-white/5 overflow-hidden">
                            {log.users?.profile_image ? (
                                <Image
                                    src={log.users.profile_image}
                                    className="object-cover"
                                    alt="User"
                                    fill
                                    unoptimized
                                />
                            ) : (
                                <User className="h-8 w-8" />
                            )}
                        </div>
                        <div>
                            <p className="text-xl font-black uppercase tracking-tight">
                                {log.users?.first_name} {log.users?.last_name}
                            </p>
                            <p className="text-sm font-medium text-foreground/40">{log.users?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Entity Information */}
                <div className="p-8 rounded-[32px] bg-card/50 border border-white/5 space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                        <Database className="h-4 w-4" /> Entity Details
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mb-1">Entity Type</p>
                            <p className="text-lg font-black">
                                {log.entity_type === 'WALLET' ? 'Crypto Wallet' : 'Fiat Payment Method'}
                            </p>
                        </div>
                        {log.entity_id && (
                            <div>
                                <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mb-1">Entity ID</p>
                                <code className="text-xs font-mono text-foreground/60 bg-black/20 px-2 py-1 rounded">
                                    {log.entity_id}
                                </code>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timestamp Information */}
                <div className="p-8 rounded-[32px] bg-card/50 border border-white/5 space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                        <Clock className="h-4 w-4" /> Timestamp Details
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mb-1">Full Timestamp</p>
                            <p className="text-base font-black">{new Date(log.created_at).toLocaleString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                timeZoneName: 'short'
                            })}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mb-1">ISO Format</p>
                            <code className="text-xs font-mono text-foreground/60 bg-black/20 px-2 py-1 rounded">
                                {log.created_at}
                            </code>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Changes */}
            <div className="p-8 rounded-[32px] bg-card border border-white/5 space-y-8">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                    <FileJson className="h-4 w-4" /> Data Changes
                </div>

                {log.action_type === 'CREATE' && !!log.new_value && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <p className="text-sm font-black uppercase tracking-widest text-emerald-500">Created Data</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                            <pre className="text-xs font-mono text-foreground/80 overflow-x-auto">
                                {JSON.stringify(log.new_value, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {log.action_type === 'DELETE' && !!log.old_value && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-2 w-2 rounded-full bg-rose-500" />
                            <p className="text-sm font-black uppercase tracking-widest text-rose-500">Deleted Data</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                            <pre className="text-xs font-mono text-foreground/80 overflow-x-auto">
                                {JSON.stringify(log.old_value, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}

                {log.action_type === 'UPDATE' && !!log.old_value && !!log.new_value && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-2 w-2 rounded-full bg-rose-500" />
                                <p className="text-sm font-black uppercase tracking-widest text-rose-500">Before</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                                <pre className="text-xs font-mono text-foreground/80 overflow-x-auto">
                                    {JSON.stringify(log.old_value, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <p className="text-sm font-black uppercase tracking-widest text-emerald-500">After</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                <pre className="text-xs font-mono text-foreground/80 overflow-x-auto">
                                    {JSON.stringify(log.new_value, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
