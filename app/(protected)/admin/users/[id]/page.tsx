import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
    User,
    Mail,
    Calendar,
    Shield,
    ShieldCheck,
    ShieldAlert,
    CheckCircle2,
    Clock,
    ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface UserProfilePageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
    const { id } = await params;
    const { data: user } = await supabaseAdmin.from('users').select('first_name, last_name').eq('id', id).single();
    return {
        title: `${user?.first_name} ${user?.last_name} | User Profile Admin`,
        description: `Managing user profile for ${user?.first_name} ${user?.last_name}`,
    };
}

interface Order {
    id: string;
    order_number: string;
    type: 'BUY' | 'SELL';
    asset: string;
    amount_crypto: number;
    amount_fiat: number;
    fiat_currency: string;
    status: string;
    created_at: string;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") redirect("/dashboard");

    const { id } = await params;

    const [
        { data: user },
        { data: kyc },
        { data: orders }
    ] = await Promise.all([
        supabaseAdmin.from('users').select('*').eq('id', id).single(),
        supabaseAdmin.from('kyc_submissions').select('*').eq('user_id', id).single(),
        supabaseAdmin.from('orders').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(10)
    ]);

    // Generate signed URLs for KYC documents if they exist
    const [frontUrl, backUrl, selfieUrl] = await Promise.all([
        kyc?.document_front ? supabaseAdmin.storage.from('kyc-documents').createSignedUrl(kyc.document_front, 3600).then(({ data }) => data?.signedUrl) : null,
        kyc?.document_back ? supabaseAdmin.storage.from('kyc-documents').createSignedUrl(kyc.document_back, 3600).then(({ data }) => data?.signedUrl) : null,
        kyc?.selfie ? supabaseAdmin.storage.from('kyc-documents').createSignedUrl(kyc.selfie, 3600).then(({ data }) => data?.signedUrl) : null
    ]);

    if (!user) {
        return <div className="p-8 text-center text-red-500">User not found</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <Link href="/admin/users" className="inline-flex items-center text-sm text-foreground/50 hover:text-primary mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Directory
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">User Profile</h1>
                        <p className="text-foreground/50 font-medium">Detailed view of user activities and verification status.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 md:px-0">
                {/* User Info Card */}
                <Card className="p-6 md:p-8 rounded-[28px] md:rounded-[32px] border-white/5 bg-card-bg/50 backdrop-blur-md space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 relative overflow-hidden">
                            {user.profile_image ? (
                                <Image
                                    src={user.profile_image}
                                    alt={`${user.first_name} ${user.last_name}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <User className="h-8 w-8 md:h-10 md:w-10" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg md:text-xl font-bold truncate">{user.first_name} {user.last_name}</h2>
                            <p className="text-[10px] md:text-sm text-foreground/40 font-mono truncate">{user.id}</p>
                            <Badge variant="outline" className={`mt-2 text-[10px] ${user.role === 'ADMIN' ? 'border-primary/50 text-primary' : 'border-white/10 text-foreground/60'}`}>
                                {user.role}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 text-sm min-w-0">
                            <Mail className="h-4 w-4 text-foreground/40 shrink-0" />
                            <span className="font-medium truncate">{user.email}</span>
                            {user.email_verified ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full shrink-0">Unverified</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-foreground/40 shrink-0" />
                            <span className="font-medium">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Shield className="h-4 w-4 text-foreground/40 shrink-0" />
                            <span className={`font-bold ${user.status === 'BANNED' ? 'text-red-500' : 'text-emerald-500'}`}>
                                {user.status}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* KYC Info Card */}
                <Card className="p-6 md:p-8 rounded-[28px] md:rounded-[32px] border-white/5 bg-card-bg/50 backdrop-blur-md lg:col-span-2">
                    <h3 className="text-base md:text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" /> Identity Verification
                    </h3>

                    {kyc ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                <div>
                                    <p className="text-[9px] md:text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Status</p>
                                    <Badge className={`text-[10px] ${kyc.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' :
                                        kyc.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {kyc.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-[9px] md:text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Submitted</p>
                                    <p className="font-medium text-xs md:text-sm">{new Date(kyc.submitted_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] md:text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Type</p>
                                    <p className="font-medium capitalize text-xs md:text-sm">{kyc.document_type?.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] md:text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Doc Number</p>
                                    <p className="font-medium text-xs md:text-sm font-mono truncate">{kyc.document_number || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Document Images Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                                {frontUrl && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Document Front</p>
                                        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/20 group">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={frontUrl} alt="ID Front" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                            <a href={frontUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">View Full</span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {backUrl && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Document Back</p>
                                        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/20 group">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={backUrl} alt="ID Back" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                            <a href={backUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">View Full</span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {selfieUrl && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Selfie</p>
                                        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/20 group">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={selfieUrl} alt="Selfie" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                            <a href={selfieUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">View Full</span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                            <ShieldAlert className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                            <p className="text-foreground/40 font-medium">No KYC submission found for this user.</p>
                        </div>
                    )}
                </Card>

                {/* Recent Activity / Orders */}
                <div className="lg:col-span-3">
                    <h3 className="text-base md:text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" /> Recent Orders
                    </h3>

                    <div className="rounded-[28px] md:rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md overflow-hidden">
                        {(orders && orders.length > 0) ? (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">Order ID</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">Type</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">Asset</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">Amount</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {orders.map((order: Order) => (
                                                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs">{order.order_number}</td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className={`text-[10px] ${order.type === 'BUY' ? 'text-emerald-500 border-emerald-500/20' : 'text-rose-500 border-rose-500/20'}`}>
                                                            {order.type}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold">{order.asset}</td>
                                                    <td className="px-6 py-4 text-sm">{order.amount_crypto} {order.asset}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs font-bold uppercase ${order.status === 'COMPLETED' ? 'text-emerald-500' :
                                                            order.status === 'PENDING' ? 'text-amber-500' : 'text-red-500'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-foreground/40">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile List View */}
                                <div className="md:hidden divide-y divide-white/5">
                                    {orders.map((order: Order) => (
                                        <div key={order.id} className="p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="font-mono text-[10px] font-bold text-foreground/40">#{order.order_number}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'COMPLETED' ? 'text-emerald-500' :
                                                    order.status === 'PENDING' ? 'text-amber-500' : 'text-red-500'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${order.type === 'BUY' ? 'text-emerald-500 border-emerald-500/20' : 'text-rose-500 border-rose-500/20'}`}>
                                                        {order.type} {order.asset}
                                                    </Badge>
                                                    <p className="text-sm font-bold">{order.amount_crypto} {order.asset}</p>
                                                </div>
                                                <p className="text-[10px] text-foreground/40">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-foreground/40 font-medium">No recent orders found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
