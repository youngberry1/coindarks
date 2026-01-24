import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
    ArrowLeft,
    Clock,
    User,
    Shield
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ReplyForm } from "@/components/admin/ReplyForm";

interface SupportMessage {
    id: string;
    message: string;
    is_admin_reply: boolean;
    created_at: string;
    users: {
        first_name: string;
        last_name: string;
        role: string;
        profile_image?: string | null;
    };
}

interface TicketPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TicketPageProps): Promise<Metadata> {
    const { id } = await params;
    const { data: ticket } = await supabaseAdmin
        .from('support_tickets')
        .select('ticket_id, subject')
        .eq('id', id)
        .single();

    return {
        title: `Ticket #${ticket?.ticket_id || id} | Support Desk`,
        description: `Managing: ${ticket?.subject || 'Support Request'}`,
    };
}

export default async function AdminTicketPage({ params }: TicketPageProps) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/dashboard");

    const { id } = await params;

    // Fetch Ticket + User
    const { data: ticket } = await supabaseAdmin
        .from('support_tickets')
        .select('*, users(first_name, last_name, email, role, kyc_status, profile_image)')
        .eq('id', id)
        .single();

    if (!ticket) return <div>Ticket not found</div>;

    // Fetch Messages
    const { data: rawMessages } = await supabaseAdmin
        .from('support_messages')
        .select('*, users(first_name, last_name, role, profile_image)')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });

    const messages = rawMessages as unknown as SupportMessage[];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto px-4 sm:px-0">
            {/* Header */}
            <div>
                <Link href="/admin/support" className="inline-flex items-center text-sm text-foreground/50 hover:text-primary mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Support Desk
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md shrink-0">#{ticket.ticket_id}</span>
                            <Badge variant="outline" className="text-[10px] md:text-xs">{ticket.category}</Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2 truncate md:whitespace-normal">{ticket.subject}</h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-foreground/60">
                            <span className="flex items-center gap-1.5 min-w-0">
                                <User className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                                <span className="truncate">{ticket.users.first_name} {ticket.users.last_name}</span>
                                <span className="opacity-40 hidden sm:inline">({ticket.users.email})</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                                {new Date(ticket.created_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all ${ticket.status === 'OPEN' ? 'bg-primary text-white shadow-lg shadow-primary/20' :
                                ticket.status === 'CLOSED' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                                    'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                            }`}>
                            {ticket.status}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Conversation Thread */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="space-y-8">
                        {messages?.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 md:gap-4 ${msg.is_admin_reply ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className="shrink-0 pt-1">
                                    <div className={`h-10 w-10 md:h-12 md:w-12 rounded-2xl overflow-hidden flex items-center justify-center border shadow-sm transition-all duration-300 ${msg.is_admin_reply
                                        ? 'bg-primary/20 border-primary/20 shadow-primary/5'
                                        : 'bg-white/5 border-white/10 shadow-black/20'
                                        }`}>
                                        {msg.is_admin_reply ? (
                                            <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                                        ) : msg.users?.profile_image ? (
                                            <div className="relative h-full w-full">
                                                <Image
                                                    src={msg.users.profile_image}
                                                    alt={msg.users.first_name}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <span className="font-bold text-xs md:text-sm text-foreground/40">
                                                {msg.users?.first_name[0]}{msg.users?.last_name[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={`flex flex-col max-w-[85%] md:max-w-[80%] space-y-2 ${msg.is_admin_reply ? 'items-end' : 'items-start'}`}>
                                    <div className={`rounded-3xl p-5 md:p-6 shadow-2xl transition-all duration-500 ${msg.is_admin_reply
                                        ? 'bg-primary text-white border border-primary/20 rounded-tr-none'
                                        : 'bg-card-bg/80 backdrop-blur-md border border-white/5 rounded-tl-none'
                                        }`}>
                                        <div className="flex items-center justify-between gap-6 mb-3">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${msg.is_admin_reply ? 'text-white/60' : 'text-primary'}`}>
                                                {msg.is_admin_reply ? 'Support Team' : 'Member Message'}
                                            </span>
                                            <span className={`text-[10px] font-mono font-medium ${msg.is_admin_reply ? 'text-white/40' : 'text-foreground/20'}`}>
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                                            {msg.message}
                                        </p>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground/20 px-2 italic">
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reply Form */}
                    <div className="pt-8 border-t border-white/5">
                        <ReplyForm ticketId={ticket.id} />
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="p-8 rounded-[32px] border-white/5 bg-card-bg/30 backdrop-blur-xl sticky top-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Member Data</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="group transition-all">
                                <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-primary" />
                                    Direct Email
                                </p>
                                <p className="text-sm font-mono font-medium text-foreground group-hover:text-primary transition-colors truncate">{ticket.users.email}</p>
                            </div>

                            <div className="flex flex-wrap gap-6 pt-4 border-t border-white/5">
                                <div className="flex-1 min-w-[100px]">
                                    <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mb-2">Access Role</p>
                                    <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase py-1 px-3 border-white/10 bg-white/5">{ticket.users.role}</Badge>
                                </div>
                                <div className="flex-1 min-w-[100px]">
                                    <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mb-2">ID Integrity</p>
                                    <Badge className={`text-[10px] font-black tracking-widest uppercase py-1 px-3 shadow-lg ${ticket.users.kyc_status === 'APPROVED'
                                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 shadow-emerald-500/5'
                                        : 'bg-amber-500/20 text-amber-500 border border-amber-500/20 shadow-amber-500/5'
                                        }`}>
                                        {ticket.users.kyc_status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
