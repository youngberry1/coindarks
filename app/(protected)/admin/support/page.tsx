import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import { TicketSearch } from "@/components/admin/TicketSearch";
import { TicketList } from "@/components/admin/TicketList";
import { TicketListSkeleton } from "@/components/admin/TicketListSkeleton";

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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Support Desk</h1>
                    <p className="text-foreground/50 font-medium">Manage member inquiries and requests.</p>
                </div>
                <TicketSearch />
            </div>

            <Suspense key={q} fallback={<TicketListSkeleton />}>
                <TicketList q={q} />
            </Suspense>
        </div>
    );
}
