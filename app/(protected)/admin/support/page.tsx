import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { getTickets } from "@/actions/support";
import { TicketList } from "@/components/admin/TicketList";

interface Ticket {
    id: string;
    status: 'OPEN' | 'CLOSED';
    created_at: string;
    subject: string;
    message: string;
    user_id: string;
    order_id?: string | null;
    users: {
        first_name: string;
        last_name: string;
        email: string;
    };
    orders?: {
        order_number: string;
    } | null;
}

export default async function AdminSupportPage() {
    const session = await auth();

    // Strict admin check
    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    const tickets = await getTickets() as Ticket[];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Support Center</h1>
                    <p className="text-foreground/50 font-medium">
                        Manage user tickets, resolve order disputes and provide assistance.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest leading-none mb-1">Open Tickets</p>
                            <p className="text-sm font-bold">{tickets?.filter(t => t.status === 'OPEN').length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <TicketList initialTickets={tickets} />
            </div>
        </div>
    );
}
