/* eslint-disable @next/next/no-img-element */
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/kyc-storage";
import {
    ArrowLeft,
    User,
    Hash,
    ArrowUpRight,
    ArrowDownLeft
} from "lucide-react";
import Link from "next/link";
import { formatCryptoAmount } from "@/lib/formatters";
import { OrderDestinationCard } from "@/components/admin/OrderDestinationCard";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/dashboard");

    const { id } = await params;

    // Fetch order details
    const { data: order } = await supabaseAdmin
        .from('orders')
        .select(`
            *,
            users (
                first_name,
                last_name,
                email,
                profile_image
            )
        `)
        .eq('id', id)
        .single();

    if (!order) return <div className="p-10 text-center">Order not found</div>;

    // Fetch Wallet Network if it exists (for BUY orders)
    let network = null;
    if (order.receiving_address) {
        const { data: wallet } = await supabaseAdmin
            .from('wallets')
            .select('network')
            .eq('address', order.receiving_address)
            .maybeSingle();

        network = wallet?.network;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
            {/* Header */}
            <div>
                <Link href="/admin/orders" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-colors mb-8 group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Transactions
                </Link>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`h-2 w-2 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-500' : order.status === 'PENDING' ? 'bg-blue-500' : 'bg-amber-500'} animate-pulse`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">{order.status} TRADE</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">Trade #{order.order_number}</h1>
                        <p className="text-foreground/50 font-medium">Created on {new Date(order.created_at).toLocaleString()}</p>
                    </div>

                    <div className="flex bg-card border border-white/5 rounded-2xl p-1.5">
                        <div className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${order.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                            {order.type === 'BUY' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                            {order.type} {order.asset}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Details */}
                <div className="p-8 rounded-[32px] bg-card/50 border border-white/5 space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                        <User className="h-4 w-4" /> User Information
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary/40 border border-white/5">
                            {order.users?.profile_image ? (
                                <img src={order.users.profile_image} alt="profile" className="h-full w-full object-cover rounded-2xl" />
                            ) : (
                                <User className="h-8 w-8" />
                            )}
                        </div>
                        <div>
                            <p className="text-xl font-black uppercase tracking-tight">{order.users?.first_name} {order.users?.last_name}</p>
                            <p className="text-sm font-medium text-foreground/40">{order.users?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Amount Details */}
                <div className="p-8 rounded-[32px] bg-card/50 border border-white/5 space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">
                        <Hash className="h-4 w-4" /> Transaction Value
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                            <div>
                                <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mb-1">Crypto Amount</p>
                                <p className="text-2xl font-black tabular-nums">{formatCryptoAmount(order.amount_crypto, order.asset)} {order.asset}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mb-1">Fiat Value</p>
                            <p className="text-xl font-black tabular-nums text-foreground/60">≈ {order.amount_fiat.toLocaleString()} {order.fiat_currency}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Network & Wallet Details */}
            <OrderDestinationCard
                address={order.receiving_address}
                network={network}
                orderType={order.type}
            />
        </div>
    );
}
