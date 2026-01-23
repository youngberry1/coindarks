import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
    History,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    ShoppingBag
} from "lucide-react";
import { SearchInput } from "@/components/dashboard/SearchInput";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Trade History | CoinDarks",
    description: "View and track your previous trades.",
};

export default async function UserOrdersPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const session = await auth();
    if (!session) redirect("/login");

    // Await searchParams in Next.js 15
    const params = await searchParams;

    // Use service role admin client to bypass RLS (since we are server-side and authenticated via NextAuth)
    const supabase = supabaseAdmin;

    let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

    if (params.q) {
        query = query.ilike('order_number', `%${params.q}%`);
    }

    const { data: orders } = await query;



    const { data: user } = await supabase
        .from('users')
        .select('kyc_status')
        .eq('id', session.user.id)
        .single();

    const isAdmin = session.user.role === 'ADMIN';
    const isKycApproved = user?.kyc_status === 'APPROVED' || isAdmin;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Trade History</h1>
                    <p className="text-foreground/50 font-medium">
                        View your past asset purchases and sales.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search Form */}
                    {/* Search Form */}
                    <SearchInput />

                    {isKycApproved && (
                        <Link
                            href="/dashboard/exchange"
                            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all whitespace-nowrap"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            <span className="hidden md:inline">Start Trade</span>
                            <span className="md:hidden">Start</span>
                        </Link>
                    )}
                </div>
            </div>

            {(!orders || orders.length === 0) ? (
                <div className="text-center py-20 px-8 rounded-[40px] border border-white/5 bg-card-bg/30 backdrop-blur-xl">
                    <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-foreground/10">
                        <History className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-black mb-3">No Trades Yet</h2>
                    <p className="text-foreground/40 font-medium max-w-sm mx-auto mb-8">
                        {params.q ? `No results matching "${params.q}"` : "Once you start trading, your history will appear here. Begin your journey by making your first purchase."}
                    </p>
                    {isKycApproved && !params.q && (
                        <Link href="/dashboard/exchange" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                            Start Trade <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                    {params.q && (
                        <Link href="/dashboard/orders" className="text-sm font-bold text-primary hover:underline">
                            Clear Search
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/dashboard/orders/${order.id}`}
                            className="block p-6 md:p-8 rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md hover:border-white/10 hover:bg-card-bg/60 transition-all group relative overflow-hidden"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border",
                                        order.type === 'BUY' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                    )}>
                                        {order.type === 'BUY' ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-black">{order.type} {order.asset}</h3>
                                            <span className="font-mono text-[10px] text-foreground/20 font-bold bg-white/5 px-2 py-0.5 rounded uppercase tracking-widest">{order.order_number}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-foreground/40 font-medium">
                                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                            <span className="h-1 w-1 rounded-full bg-white/10" />
                                            <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-8">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-black text-foreground">{order.amount_crypto} {order.asset}</p>
                                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">Amount</p>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-black text-foreground">{order.amount_fiat} {order.fiat_currency}</p>
                                        <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">Price Paid</p>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                                        order.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                            order.status === 'CANCELLED' ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" :
                                                order.status === 'PROCESSING' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                                    "bg-primary/10 text-primary border border-primary/20"
                                    )}>
                                        {order.status === 'COMPLETED' ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                                            order.status === 'CANCELLED' ? <XCircle className="h-3.5 w-3.5" /> :
                                                <Clock className="h-3.5 w-3.5 animate-pulse" />}
                                        {order.status}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile specific view for amounts */}
                            <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4 sm:hidden">
                                <div>
                                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mb-1">Amount</p>
                                    <p className="text-sm font-black">{order.amount_crypto} {order.asset}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mb-1">Price Paid</p>
                                    <p className="text-sm font-black">{order.amount_fiat} {order.fiat_currency}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
