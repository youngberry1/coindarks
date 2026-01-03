
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { OrderDetailsCard } from "@/components/dashboard/OrderDetailsCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: PageProps) {
    const session = await auth();
    if (!session) redirect("/login");

    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // Fetch order
    const { data: order, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', session.user.id)
        .single();

    if (error || !order) {
        return notFound();
    }

    // Determine the admin wallet address to show (if pending)
    let depositAddress = undefined;

    if (order.status === 'PENDING') {
        const targetCurrency = order.type === 'BUY' ? order.fiat_currency : order.asset;

        const { data: wallet } = await supabaseAdmin
            .from('admin_wallets')
            .select('address')
            .eq('currency', targetCurrency)
            .eq('is_active', true)
            .single();

        if (wallet) {
            depositAddress = wallet.address;
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/orders" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Order Details</h1>
                    <p className="text-foreground/50 font-medium text-sm">View transaction details</p>
                </div>
            </div>

            <OrderDetailsCard order={order} depositAddress={depositAddress} />
        </div>
    );
}
