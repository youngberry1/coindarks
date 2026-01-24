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
    title: "Global Transactions | CoinDarks Admin",
    description: "Institutional oversight of platform-wide trade transactions.",
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
                        <span className="text-[10px] font-black uppercase tracking-wider sm:tracking-[0.4em] text-foreground/40">Transaction Hub : Global Oversight</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none uppercase">
                        Global <br />
                        <span className="text-gradient leading-relaxed">Transactions.</span>
                    </h1>
                    <p className="text-base sm:text-xl text-foreground/50 font-medium max-w-2xl leading-relaxed">
                        Global oversight of platform trades and settlements. monitor live activity,
                        audit transaction correctness, and manage institutional fulfillment.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="h-16 sm:h-20 px-6 sm:px-8 rounded-2xl sm:rounded-3xl glass border border-amber-500/10 flex items-center gap-4 sm:gap-5 shadow-2xl group transition-all hover:bg-amber-500/2 w-full sm:w-auto">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                            <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-amber-500/40 uppercase tracking-[0.2em] leading-none mb-1 sm:mb-1.5">Pending Action</p>
                            <p className="text-base sm:text-xl font-black tabular-nums text-amber-500">{pendingActions} Trades</p>
                        </div>
                    </div>
                    <div className="h-16 sm:h-20 px-6 sm:px-8 rounded-2xl sm:rounded-3xl glass border border-white/5 flex items-center gap-4 sm:gap-5 shadow-2xl w-full sm:w-auto">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] leading-none mb-1 sm:mb-1.5">Trade Record</p>
                            <p className="text-base sm:text-xl font-black tabular-nums">{orders?.length || 0} Total</p>
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
