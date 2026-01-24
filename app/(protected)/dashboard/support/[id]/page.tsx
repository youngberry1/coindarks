import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getUserTicket, getTicketMessages } from "@/actions/support";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Clock, Shield } from "lucide-react";
import { UserReplyForm } from "@/components/dashboard/UserReplyForm";
import Image from "next/image";

interface TicketDetailProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TicketDetailProps): Promise<Metadata> {
    const { id } = await params;
    const ticket = await getUserTicket(id);
    return {
        title: `Support Ticket #${ticket?.ticket_id || id} | CoinDarks`,
        description: "View and respond to your support ticket.",
    };
}

export default async function UserTicketDetailPage({ params }: TicketDetailProps) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const { id } = await params;
    const ticket = await getUserTicket(id);

    if (!ticket) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <h2 className="text-2xl font-bold mb-4">Ticket Not Found</h2>
                <Link href="/dashboard/support" className="text-primary hover:underline">
                    Back to Support
                </Link>
            </div>
        );
    }

    interface MessageItem {
        id: string;
        is_admin_reply: boolean;
        created_at: string;
        message: string;
        users?: {
            first_name?: string;
            last_name?: string;
            profile_image?: string | null;
        };
    }

    // Now fetch messages using the Ticket's UUID (ticket.id), not the public ID (ticket.ticket_id)
    const rawMessages = await getTicketMessages(ticket.id);
    const messages = rawMessages as unknown as MessageItem[];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-6xl mx-auto">
            {/* Header */}
            <div className="px-4 md:px-0">
                <Link href="/dashboard/support" className="inline-flex items-center text-sm text-foreground/50 hover:text-primary mb-6 transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to My Tickets
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-mono text-[10px] md:text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-md shrink-0">#{ticket.ticket_id}</span>
                            <Badge variant="outline" className="text-[10px] md:text-xs">{ticket.category}</Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2 truncate md:whitespace-normal">{ticket.subject}</h1>
                        <div className="flex items-center gap-4 text-xs md:text-sm text-foreground/60">
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                {new Date(ticket.created_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl font-bold uppercase text-[10px] md:text-xs tracking-widest self-start ${ticket.status === 'OPEN' ? 'bg-primary text-white' :
                        ticket.status === 'CLOSED' ? 'bg-emerald-500 text-white' :
                            'bg-amber-500 text-white'
                        }`}>
                        {ticket.status}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="space-y-6 px-2 md:px-0">
                <div className="space-y-8">
                    {messages?.map((msg: MessageItem) => (
                        <div key={msg.id} className={`flex gap-3 md:gap-4 ${!msg.is_admin_reply ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="shrink-0">
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
                                                alt="User"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <span className="font-bold text-xs md:text-sm text-foreground/40">
                                            {msg.users?.first_name?.[0]}{msg.users?.last_name?.[0]}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={`flex flex-col max-w-[90%] md:max-w-[80%] xl:max-w-[70%] space-y-2 ${!msg.is_admin_reply ? 'items-end' : 'items-start'}`}>
                                <div className={`rounded-3xl p-5 md:p-6 shadow-2xl transition-all duration-500 ${!msg.is_admin_reply
                                    ? 'bg-primary text-white border border-primary/20 rounded-tr-none'
                                    : 'bg-card-bg/80 backdrop-blur-md border border-white/5 rounded-tl-none'
                                    }`}>
                                    <div className="flex items-center justify-between gap-4 mb-3">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${!msg.is_admin_reply ? 'text-white/60' : 'text-primary'}`}>
                                            {msg.is_admin_reply ? 'Support Team' : 'Member Account'}
                                        </span>
                                        <span className={`text-[10px] font-mono font-medium ${!msg.is_admin_reply ? 'text-white/40' : 'text-foreground/20'}`}>
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
                {ticket.status !== 'CLOSED' && (
                    <div className="pt-8 border-t border-white/5">
                        <UserReplyForm ticketId={ticket.id} />
                    </div>
                )}
                {ticket.status === 'CLOSED' && (
                    <div className="p-6 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                        <p className="text-foreground/50">This ticket is closed. Please create a new ticket if you need further assistance.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
