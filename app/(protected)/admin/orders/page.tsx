import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/kyc-storage";
import {
    ShoppingBag,
    Activity
} from "lucide-react";
import { AdminOrderList } from "@/components/admin/AdminOrderList";

export const metadata: Metadata = {
    title: "Settlement Base | CoinDarks Admin",
    description: "Institutional oversight of platform-wide settlement cycles.",
};

export default async function AdminOrdersPage() {
    const session = await auth();

    // Strict admin check
    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    // Fetch all orders with user info using Admin client to bypass RLS
    const { data: orders } = await supabaseAdmin
        .from('orders')
        .select(`
            *,
            users (
                first_name,
                last_name,
                email
            )
        `)
        .order('created_at', { ascending: false });

    const pendingActions = orders?.filter((o: { status: string }) => o.status === 'PENDING' || o.status === 'PROCESSING').length || 0;

    return (
        <div className="space-y-12 sm:space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header / Settlement Focus */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">Settlement Node : Master Oversight</span>
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none uppercase">
                        Settlement <br />
                        <span className="text-gradient leading-relaxed">Base.</span>
                    </h1>
                    <p className="text-xl text-foreground/50 font-medium max-w-2xl leading-relaxed">
                        Global oversight of the platform liquidity bridge. monitor live settlement cycles,
                        audit transaction fidelity, and manage institutional fulfillment.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-20 px-8 rounded-3xl glass border border-amber-500/10 flex items-center gap-5 shadow-2xl group transition-all hover:bg-amber-500/2">
                        <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-amber-500/40 uppercase tracking-[0.2em] leading-none mb-1.5">Action Required</p>
                            <p className="text-xl font-black tabular-nums text-amber-500">{pendingActions} Units</p>
                        </div>
                    </div>
                    <div className="h-20 px-8 rounded-3xl glass border border-white/5 flex items-center gap-5 shadow-2xl">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] leading-none mb-1.5">Total Cycles</p>
                            <p className="text-xl font-black tabular-nums">{orders?.length || 0} Resolved</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-10">
                {orders && <AdminOrderList initialOrders={orders} />}
            </div>
        </div>
    );
}
