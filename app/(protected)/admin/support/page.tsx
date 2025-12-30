import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
    MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { TicketSearch } from "@/components/admin/TicketSearch";

interface AdminSupportPageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function AdminSupportPage({ searchParams }: AdminSupportPageProps) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/dashboard");

    const { q } = await searchParams;

    let query = supabaseAdmin
        .from('support_tickets')
        .select('*, users(first_name, last_name, email)')
        .order('created_at', { ascending: false });

    if (q) {
        // Search by ID, Subject, or User Email (requires join filtering which is tricky in one go, 
        // so for now simpler search or use simple ID/Subject match)
        // Note: Supabase strict filtering on related tables is complex. 
        // We'll search primarily on Ticket ID and Subject.
        query = query.or(`ticket_id.ilike.%${q}%,subject.ilike.%${q}%`);
    }

    const { data: tickets } = await query;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Support Tickets</h1>
                    <p className="text-foreground/50 font-medium">Manage user inquiries and issues.</p>
                </div>
                <TicketSearch />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tickets && tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <Link key={ticket.id} href={`/admin/support/${ticket.id}`} className="group">
                            <Card className="p-6 rounded-2xl border-white/5 bg-card-bg/50 backdrop-blur-md hover:bg-white/5 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${ticket.status === 'OPEN' ? 'bg-primary/10 text-primary' :
                                    ticket.status === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-500' :
                                        'bg-amber-500/10 text-amber-500'
                                    }`}>
                                    <MessageSquare className="h-6 w-6" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-mono text-xs font-bold text-foreground/40">#{ticket.ticket_id}</span>
                                        <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">{ticket.subject}</h3>
                                    </div>
                                    <p className="text-sm text-foreground/60 flex items-center gap-2">
                                        <span className="font-medium text-foreground">{ticket.users?.first_name} {ticket.users?.last_name}</span>
                                        <span className="text-foreground/30">•</span>
                                        <span>{ticket.users?.email}</span>
                                        <span className="text-foreground/30">•</span>
                                        <span>{new Date(ticket.created_at).toLocaleString()}</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className={`${ticket.status === 'OPEN' ? 'border-primary/50 text-priority' :
                                        ticket.status === 'CLOSED' ? 'border-emerald-500/50 text-emerald-500' :
                                            'border-amber-500/50 text-amber-500'
                                        }`}>
                                        {ticket.status}
                                    </Badge>
                                    <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">
                                        {ticket.priority}
                                    </Badge>
                                </div>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="p-12 text-center border border-dashed border-white/10 rounded-[32px]">
                        <MessageSquare className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                        <p className="text-foreground/40 font-medium">No tickets found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
