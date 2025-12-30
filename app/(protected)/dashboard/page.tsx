import { auth } from "@/auth";
import {
    AlertCircle,
    ArrowUpRight,
    ArrowDownLeft,
    ShieldAlert,
    CheckCircle2,
    Globe,
    ExternalLink,
    RefreshCcw,
    ArrowRight,
    ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import TradeableAssets from '@/components/dashboard/TradeableAssets';
import { getCryptos } from '@/actions/crypto';

export default async function DashboardPage() {
    const session = await auth();
    const user = session?.user;

    // Fetch user details for KYC status
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('kyc_status')
        .eq('id', user?.id)
        .single();

    // Fetch inventory
    // const { data: inventory } = await supabaseAdmin... (removed)

    // Fetch recent orders for support linking
    const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, asset, amount_crypto')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

    const kycStatus = userData?.kyc_status || 'UNSUBMITTED';
    const isAdmin = user?.role === "ADMIN";
    const firstName = user?.name?.split(" ")[0] || "Trader";

    // Fetch active cryptos
    const cryptos = await getCryptos(true);

    return (
        <div className="space-y-10 md:space-y-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">
                        Welcome back, <span className="text-gradient">{firstName}!</span>
                    </h1>
                    <p className="text-foreground/50 font-medium">
                        {isAdmin ? "Platform oversight and management dashboard." : "What would you like to trade today?"}
                    </p>
                </div>

                {!isAdmin && (
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/exchange?type=buy" className="group relative px-6 py-3 rounded-2xl bg-primary text-white flex items-center gap-2 overflow-hidden shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-sm uppercase tracking-widest font-black">
                            <ArrowDownLeft className="h-4 w-4" />
                            <span>Buy Crypto</span>
                        </Link>
                        <Link href="/dashboard/exchange?type=sell" className="group relative px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 overflow-hidden hover:bg-white/10 transition-all text-sm uppercase tracking-widest font-black">
                            <ArrowUpRight className="h-4 w-4 text-primary" />
                            <span>Sell Crypto</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* KYC Alert - Hidden for Admins */}
            {!isAdmin && kycStatus !== 'APPROVED' && (
                <div className={`relative overflow-hidden p-6 rounded-[32px] border group ${kycStatus === 'REJECTED' ? 'border-red-500/20 bg-red-500/5' :
                    kycStatus === 'PENDING' ? 'border-amber-500/20 bg-amber-500/5' :
                        'border-amber-500/20 bg-amber-500/5'
                    }`}>
                    <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity ${kycStatus === 'REJECTED' ? 'text-red-500' : 'text-amber-500'
                        }`}>
                        <ShieldAlert className="h-24 w-24 rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${kycStatus === 'REJECTED' ? 'bg-red-500/20' : 'bg-amber-500/20'
                            }`}>
                            <ShieldAlert className={`h-6 w-6 ${kycStatus === 'REJECTED' ? 'text-red-500' : 'text-amber-500'
                                }`} />
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-lg font-bold mb-1 ${kycStatus === 'REJECTED' ? 'text-red-500' : 'text-amber-500'
                                }`}>
                                {kycStatus === 'PENDING' ? 'Verification Under Review' :
                                    kycStatus === 'REJECTED' ? 'Verification Rejected' :
                                        'Action Required: ID Verification'}
                            </h3>
                            <p className="text-sm text-foreground/60 max-w-2xl font-medium">
                                {kycStatus === 'PENDING' ? 'Your documents have been submitted and are currently being reviewed by our team. This usually takes 24-48 hours.' :
                                    kycStatus === 'REJECTED' ? 'Your verification was rejected. Please review the email sent to you for the reason and resubmit your documents.' :
                                        'To ensure maximum security and reliability, please complete your Identity Verification. It only takes 2 minutes and a valid ID card.'}
                            </p>
                        </div>
                        <Link
                            href="/dashboard/settings?tab=verification"
                            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all text-center ${kycStatus === 'REJECTED' ? 'bg-red-500 text-white' :
                                kycStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-default pointer-events-none' :
                                    'bg-amber-500 text-black'
                                }`}
                        >
                            {kycStatus === 'PENDING' ? 'In Review' :
                                kycStatus === 'REJECTED' ? 'Resubmit Now' :
                                    'Verify Now'}
                        </Link>
                    </div>
                </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                <div className="p-8 rounded-[32px] border border-border bg-card-bg/50 backdrop-blur-md shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-start mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <RefreshCcw className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">{isAdmin ? "Total Transactions" : "Active Orders"}</span>
                    </div>
                    <p className="text-4xl font-black mb-1">{orders?.length || 0}</p>
                    <p className="text-sm text-foreground/40 font-medium">{isAdmin ? "Platform wide" : "In the last 30 days"}</p>
                </div>

                <div className="p-8 rounded-[32px] border border-border bg-card-bg/50 backdrop-blur-md shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isAdmin ? "bg-emerald-500/10" : (kycStatus === 'APPROVED' ? 'bg-emerald-500/10' :
                            kycStatus === 'PENDING' ? 'bg-amber-500/10' :
                                kycStatus === 'REJECTED' ? 'bg-red-500/10' :
                                    'bg-primary/10')
                            }`}>
                            {isAdmin ? <ShieldCheck className="h-6 w-6 text-emerald-500" /> : (kycStatus === 'APPROVED' ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> :
                                kycStatus === 'PENDING' ? <ShieldAlert className="h-6 w-6 text-amber-500" /> :
                                    kycStatus === 'REJECTED' ? <AlertCircle className="h-6 w-6 text-red-500" /> :
                                        <ShieldCheck className="h-6 w-6 text-primary" />
                            )}
                        </div>
                        <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">{isAdmin ? "Admin Role" : "Verified Status"}</span>
                    </div>
                    <p className={`text-2xl font-black mb-1 uppercase tracking-tight ${isAdmin ? "text-emerald-500" : (kycStatus === 'APPROVED' ? 'text-emerald-500' :
                        kycStatus === 'PENDING' ? 'text-amber-500' :
                            kycStatus === 'REJECTED' ? 'text-red-500' :
                                'text-foreground')
                        }`}>
                        {isAdmin ? "Authorized" : (kycStatus === 'APPROVED' ? 'Verified' : kycStatus === 'UNSUBMITTED' ? 'Not Verified' : kycStatus)}
                    </p>
                    <p className="text-sm text-foreground/40 font-medium">
                        {isAdmin ? "Full Access Granted" : (kycStatus === 'APPROVED' ? 'Identity Secured' :
                            kycStatus === 'PENDING' ? 'Under Review' :
                                kycStatus === 'REJECTED' ? 'Action Required' :
                                    'Verify to unlock')}
                    </p>
                </div>

                <div className="p-8 rounded-[32px] border border-border bg-card-bg/50 backdrop-blur-md shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-start mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                            <Globe className="h-6 w-6 text-secondary" />
                        </div>
                        <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Global Rates</span>
                    </div>
                    <p className="text-2xl font-black mb-1">Live Feed</p>
                    <Link href="/#market" className="text-sm text-secondary hover:underline font-bold flex items-center gap-1">
                        View Market <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 md:gap-14">
                {/* Tradeable Assets - Dynamic */}
                <div className="xl:col-span-8">
                    <TradeableAssets initialData={cryptos} />
                </div>

                {/* Support / Management Sidebar */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="p-8 rounded-[40px] border border-border bg-card-bg/50 backdrop-blur-md shadow-sm dark:shadow-none">
                        <h3 className="text-lg font-black mb-6 uppercase tracking-widest">{isAdmin ? "Admin Controls" : "Quick Links"}</h3>
                        <div className="space-y-6">
                            {!isAdmin ? (
                                <div className="p-6 rounded-3xl bg-card-bg border border-border shadow-sm dark:shadow-none">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-3">Navigation</h4>
                                    <ul className="space-y-3">
                                        <li>
                                            <Link href="/dashboard/orders" className="flex items-center justify-between text-sm font-bold hover:text-primary transition-colors">
                                                Order History <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/dashboard/settings?tab=verification" className="flex items-center justify-between text-sm font-bold hover:text-primary transition-colors">
                                                Verification <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-foreground/50 font-medium">Quickly navigate to management centers.</p>
                                    <Link href="/admin/kyc" className="flex items-center justify-between p-5 rounded-2xl bg-card-bg border border-border shadow-sm dark:shadow-none font-bold hover:bg-card-bg/80 transition-all">
                                        KYC Review Center <ArrowRight className="h-4 w-4 text-primary" />
                                    </Link>
                                    <Link href="/admin/orders" className="flex items-center justify-between p-5 rounded-2xl bg-card-bg border border-border shadow-sm dark:shadow-none font-bold hover:bg-card-bg/80 transition-all">
                                        Order Management <ArrowRight className="h-4 w-4 text-primary" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
