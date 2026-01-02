import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
    ArrowLeft,
    Clock,
    User,
    Shield
} from "lucide-react";
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
    };
}

interface TicketPageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminTicketPage({ params }: TicketPageProps) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/dashboard");

    const { id } = await params;

    // Fetch Ticket + User
    const { data: ticket } = await supabaseAdmin
        .from('support_tickets')
        .select('*, users(first_name, last_name, email, role, kyc_status)')
        .eq('id', id)
        .single();

    if (!ticket) return <div>Ticket not found</div>;

    // Fetch Messages
    const { data: rawMessages } = await supabaseAdmin
        .from('support_messages')
        .select('*, users(first_name, last_name, role)')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });

    const messages = rawMessages as unknown as SupportMessage[];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto px-4 sm:px-0">
            {/* Header */}
            <div>
                <Link href="/admin/support" className="inline-flex items-center text-sm text-foreground/50 hover:text-primary mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Tickets
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
                        {/* Status Actions could go here */}
                        <div className={`px - 4 py - 2 rounded - xl font - bold uppercase text - [10px] md: text - xs tracking - widest ${ticket.status === 'OPEN' ? 'bg-primary text-white' :
                            ticket.status === 'CLOSED' ? 'bg-emerald-500 text-white' :
                                'bg-amber-500 text-white'
                            } `}>
                            {ticket.status}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Conversation Thread */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-6">
                        {messages?.map((msg) => (
                            <div key={msg.id} className={`flex gap - 3 md: gap - 4 ${msg.is_admin_reply ? 'justify-end' : 'justify-start'} `}>
                                {!msg.is_admin_reply && (
                                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                                        <span className="font-bold text-[10px] md:text-xs">{msg.users?.first_name[0]}{msg.users?.last_name[0]}</span>
                                    </div>
                                )}

                                <div className={`max-w-[90%] md:max-w-[85%] rounded-[20px] md:rounded-[24px] p-4 md:p-6 ${msg.is_admin_reply
                                    ? 'bg-primary text-white rounded-tr-sm'
                                    : 'bg-card-bg border border-white/5 rounded-tl-sm'
                                    }`}>
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.is_admin_reply ? 'text-white/70' : 'text-primary'}`}>
                                            {msg.is_admin_reply ? 'Support Team' : 'User'}
                                        </span>
                                        <span className={`text-[9px] md:text-[10px] ${msg.is_admin_reply ? 'text-white/50' : 'text-foreground/30'}`}>
                                            {new Date(msg.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                </div>

                                {msg.is_admin_reply && (
                                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                                        <Shield className="h-4 w-4 md:h-5 md:w-5 text-white" />
                                    </div>
                                )}
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
                    <Card className="p-6 rounded-[24px] border-white/5 bg-card-bg/50 backdrop-blur-md">
                        <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest mb-4 text-foreground/40">User Context</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] text-foreground/40 font-bold mb-1">Email</p>
                                <p className="text-xs md:text-sm font-medium truncate">{ticket.users.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-foreground/40 font-bold mb-1">Role</p>
                                <Badge variant="outline" className="text-[10px]">{ticket.users.role}</Badge>
                            </div>
                            <div>
                                <p className="text-[10px] text-foreground/40 font-bold mb-1">KYC Status</p>
                                <Badge className={`text - [10px] ${ticket.users.kyc_status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'} `}>
                                    {ticket.users.kyc_status}
                                </Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
