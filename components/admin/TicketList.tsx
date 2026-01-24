import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface TicketListProps {
    q?: string;
}

export async function TicketList({ q }: TicketListProps) {
    let query = supabaseAdmin
        .from('support_tickets')
        .select('*, users(first_name, last_name, email, profile_image)')
        .order('created_at', { ascending: false });

    if (q) {
        // Step 1: Find users matching the email search term
        const { data: matchingUsers } = await supabaseAdmin
            .from('users')
            .select('id')
            .ilike('email', `%${q}%`);

        const userIds = matchingUsers?.map(u => u.id) || [];

        // Step 2: Build the OR query
        let orCondition = `ticket_id.ilike.%${q}%,subject.ilike.%${q}%`;

        if (userIds.length > 0) {
            orCondition += `,user_id.in.(${userIds.join(',')})`;
        }

        query = query.or(orCondition);
    }

    const { data: tickets } = await query;

    if (!tickets || tickets.length === 0) {
        return (
            <div className="p-12 text-center border border-dashed border-white/10 rounded-[32px]">
                <MessageSquare className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                <p className="text-foreground/40 font-medium">No tickets found matching your query.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {tickets.map((ticket) => (
                <Link key={ticket.id} href={`/admin/support/${ticket.id}`} className="group">
                    <Card className="p-6 rounded-2xl border-white/5 bg-card-bg/50 backdrop-blur-md hover:bg-white/5 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${ticket.status === 'OPEN' ? 'bg-primary/10 text-primary' :
                            ticket.status === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-500' :
                                'bg-amber-500/10 text-amber-500'
                            }`}>
                            <MessageSquare className="h-6 w-6" />
                        </div>

                        <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                                <span className="font-mono text-[10px] md:text-xs font-bold text-foreground/40 px-2 py-0.5 rounded bg-white/5">#{ticket.ticket_id}</span>
                                <h3 className="text-base md:text-lg font-bold truncate group-hover:text-primary transition-colors">{ticket.subject}</h3>
                            </div>
                            <div className="text-xs md:text-sm text-foreground/60 flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="font-bold text-foreground truncate max-w-[150px] sm:max-w-none">{ticket.users?.first_name} {ticket.users?.last_name}</span>
                                <span className="hidden sm:inline text-foreground/20">•</span>
                                <span className="truncate max-w-[180px] sm:max-w-none font-medium">{ticket.users?.email}</span>
                                <span className="hidden md:inline text-foreground/20">•</span>
                                <span className="w-full md:w-auto mt-1 md:mt-0 opacity-40 text-[10px] md:text-xs">{new Date(ticket.created_at).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto justify-between md:justify-end pt-4 md:pt-0 border-t border-white/5 md:border-0 mt-2 md:mt-0">
                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${ticket.status === 'OPEN' ? 'border-primary/50 text-priority' :
                                ticket.status === 'CLOSED' ? 'border-emerald-500/50 text-emerald-500' :
                                    'border-amber-500/50 text-amber-500'
                                }`}>
                                {ticket.status}
                            </Badge>
                            <Badge variant="secondary" className="uppercase text-[9px] md:text-[10px] tracking-wider px-2 py-0.5">
                                {ticket.priority}
                            </Badge>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
