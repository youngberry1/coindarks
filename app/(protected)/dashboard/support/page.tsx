import { auth } from "@/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserTickets } from "@/actions/support";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, ChevronRight } from "lucide-react";
import { CreateTicketDialog } from "@/components/dashboard/CreateTicketDialog";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata: Metadata = {
    title: "Support Hub | CoinDarks",
    description: "Get assistance with your trades and account.",
};

interface TicketItem {
    id: string;
    ticket_id: string;
    subject: string;
    status: string;
    updated_at: string;
    preview_message?: string;
}

export default async function UserSupportPage() {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const result = await getUserTickets();
    // Safe cast since we know the shape from supabase
    const tickets = result as unknown as TicketItem[];

    // Fetch recent orders for the creation dialog context
    const { data: recentOrders } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, asset, amount_crypto')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">My Support Tickets</h1>
                    <p className="text-foreground/50 font-medium">Track your requests and get help.</p>
                </div>
                <CreateTicketDialog orders={recentOrders || []} />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tickets && tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <Link key={ticket.id} href={`/dashboard/support/${ticket.ticket_id}`} className="group">
                            <Card className="p-6 rounded-2xl border-white/5 bg-card-bg/50 backdrop-blur-md hover:bg-white/5 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                                    ticket.status === 'OPEN' ? 'bg-primary/10 text-primary' :
                                        ticket.status === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-500' :
                                            'bg-amber-500/10 text-amber-500'
                                )}>
                                    <MessageSquare className="h-6 w-6" />
                                </div>

                                <div className="flex-1 min-w-0 w-full">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                                        <span className="font-mono text-[10px] md:text-xs font-bold text-foreground/40 px-2 py-0.5 rounded bg-white/5">#{ticket.ticket_id}</span>
                                        <h3 className="text-base md:text-lg font-bold truncate group-hover:text-primary transition-colors">{ticket.subject}</h3>
                                    </div>
                                    <p className="text-xs md:text-sm text-foreground/60 flex items-center gap-2 mb-2">
                                        <Clock className="h-3 w-3" />
                                        <span>Last Updated: {new Date(ticket.updated_at).toLocaleString()}</span>
                                    </p>
                                    {ticket.preview_message && (
                                        <p className="text-[11px] md:text-xs text-foreground/40 line-clamp-1 italic">
                                            &quot;{ticket.preview_message}&quot;
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-4 md:pt-0 border-t border-white/5 md:border-0 mt-2 md:mt-0">
                                    <Badge variant="outline" className={cn(
                                        "text-[10px] px-2 py-0.5",
                                        ticket.status === 'OPEN' ? 'border-primary/50 text-primary' :
                                            ticket.status === 'CLOSED' ? 'border-emerald-500/50 text-emerald-500' :
                                                'border-amber-500/50 text-amber-500'
                                    )}>
                                        {ticket.status}
                                    </Badge>
                                    <ChevronRight className="h-5 w-5 text-foreground/20 group-hover:text-primary transition-colors shrink-0" />
                                </div>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="p-12 text-center border border-dashed border-white/10 rounded-[32px]">
                        <MessageSquare className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                        <h3 className="text-lg font-bold mb-2">No Active Tickets</h3>
                        <p className="text-foreground/40 font-medium mb-6">You don&apos;t have any open support requests.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import { cn } from "@/lib/utils";
