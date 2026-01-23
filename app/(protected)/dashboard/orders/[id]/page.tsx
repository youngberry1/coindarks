
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { OrderDetailsCard } from "@/components/dashboard/OrderDetailsCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: `Trade Details | CoinDarks`,
        description: "View the status and details of your crypto exchange.",
    };
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

    // Fetch payment methods for pending orders
    let paymentMethods: Array<{ type: string; address: string; label?: string }> = [];

    if (order.status === 'PENDING' && order.type === 'BUY') {
        const targetCurrency = order.fiat_currency;

        // Fetch all active wallets for this currency
        const { data: wallets } = await supabaseAdmin
            .from('admin_wallets')
            .select('chain, address, label')
            .eq('currency', targetCurrency)
            .eq('is_active', true);

        if (wallets && wallets.length > 0) {
            // For GHS: Show both Bank and Mobile Money
            // For NGN: Show only Bank
            if (targetCurrency === 'GHS') {
                paymentMethods = wallets.map(w => ({
                    type: w.chain,
                    address: w.address,
                    label: w.label
                }));
            } else if (targetCurrency === 'NGN') {
                // Only show bank accounts for NGN
                paymentMethods = wallets
                    .filter(w => w.chain === 'BANK')
                    .map(w => ({
                        type: w.chain,
                        address: w.address,
                        label: w.label
                    }));
            }
        }
    } else if (order.status === 'PENDING' && order.type === 'SELL') {
        // For SELL orders, get crypto wallet address
        const { data: wallet } = await supabaseAdmin
            .from('admin_wallets')
            .select('address, label')
            .eq('currency', order.asset)
            .eq('is_active', true)
            .single();

        if (wallet) {
            paymentMethods = [{
                type: 'CRYPTO',
                address: wallet.address,
                label: wallet.label
            }];
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/orders" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Trade Details</h1>
                    <p className="text-foreground/50 font-medium text-sm">Detailed view of your activity</p>
                </div>
            </div>

            <OrderDetailsCard order={order} paymentMethods={paymentMethods} />
        </div>
    );
}
