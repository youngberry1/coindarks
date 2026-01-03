import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/kyc-storage";
import {
    ShoppingBag
} from "lucide-react";
import { AdminOrderList } from "@/components/admin/AdminOrderList";

export const metadata: Metadata = {
    title: "Order Management | CoinDarks Admin",
    description: "Monitor and manage platform-wide orders.",
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Order Management</h1>
                    <p className="text-foreground/50 font-medium">
                        Monitor live transactions, update statuses and manage fulfillment.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                        <ShoppingBag className="h-5 w-5 text-amber-500" />
                        <div>
                            <p className="text-[10px] font-black text-amber-500/50 uppercase tracking-widest leading-none mb-1">Pending Action</p>
                            <p className="text-sm font-bold text-amber-500">{orders?.filter((o: { status: string }) => o.status === 'PENDING' || o.status === 'PROCESSING').length || 0}</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest leading-none mb-1">Total orders</p>
                            <p className="text-sm font-bold">{orders?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>


            {orders && <AdminOrderList initialOrders={orders} />}
        </div>
    );
}
