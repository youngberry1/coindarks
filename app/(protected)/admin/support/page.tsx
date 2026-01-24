import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import { TicketSearch } from "@/components/admin/TicketSearch";
import { TicketList } from "@/components/admin/TicketList";
import { TicketListSkeleton } from "@/components/admin/TicketListSkeleton";
import { getTicketStats } from "@/lib/actions/ticket-actions";

export const metadata: Metadata = {
    title: "Support Desk | CoinDarks Admin",
    description: "Manage and respond to member support requests.",
};

interface AdminSupportPageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function AdminSupportPage({ searchParams }: AdminSupportPageProps) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/dashboard");

    const { q } = await searchParams;
    const stats = await getTicketStats();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Premium Header Section */}
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Support Desk</h1>
                    <p className="text-foreground/50 font-medium text-lg">Manage and respond to member inquiries.</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-[24px] bg-card border border-white/5 flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Total Tickets</span>
                        <span className="text-3xl font-black">{stats.total}</span>
                    </div>
                    <div className="p-6 rounded-[24px] bg-card border border-white/5 flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Open Inquiries</span>
                        <span className="text-3xl font-black text-primary">{stats.open}</span>
                    </div>
                    <div className="p-6 rounded-[24px] bg-card border border-white/5 flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70">Resolved</span>
                        <span className="text-3xl font-black text-emerald-500">{stats.closed}</span>
                    </div>
                </div>
            </div>

            {/* Toolbar & Content */}
            <div className="bg-card/50 border border-white/5 rounded-[32px] p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">Ticket Queue</h2>
                    <TicketSearch />
                </div>

                <Suspense key={q} fallback={<TicketListSkeleton />}>
                    <TicketList q={q} />
                </Suspense>
            </div>
        </div>
    );
}
