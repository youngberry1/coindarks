"use client";

import { useState } from "react";
import {
    ArrowUpRight,
    ArrowDownLeft,
    User,
    Copy,
    ExternalLink,
    Search,
    CheckCircle2,
    Hash,
    Activity,
    Sparkles
} from "lucide-react";
import { updateOrderStatus } from "@/actions/admin";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

interface AdminOrderListProps {
    initialOrders: {
        id: string;
        order_number: string;
        user_id: string;
        type: 'BUY' | 'SELL';
        asset: string;
        amount_crypto: number;
        amount_fiat: number;
        fiat_currency: string;
        receiving_address: string;
        status: OrderStatus;
        created_at: string;
        users: {
            first_name: string;
            last_name: string;
            email: string;
        };
    }[];
}

export function AdminOrderList({ initialOrders }: AdminOrderListProps) {
    const [orders, setOrders] = useState(initialOrders);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const result = await updateOrderStatus(orderId, newStatus as OrderStatus);
            if (result.success) {
                toast.success(`Unit ${orderId.slice(0, 8)} updated to ${newStatus}`);
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as OrderStatus } : o));
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const copyAddress = (address: string, id: string) => {
        navigator.clipboard.writeText(address);
        toast.success("Registry Endpoint Captured");
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const openExplorer = (address: string) => {
        window.open(`https://blockchair.com/search?q=${address}`, '_blank');
    };

    const filteredOrders = orders.filter(o =>
        o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.users.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.users.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.users.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
            case 'CANCELLED': return "text-rose-500 border-rose-500/20 bg-rose-500/10";
            case 'PROCESSING': return "text-amber-500 border-amber-500/20 bg-amber-500/10";
            case 'PENDING': return "text-blue-500 border-blue-500/20 bg-blue-500/10";
            default: return "text-foreground/50 border-white/10 bg-white/5";
        }
    };

    return (
        <div className="space-y-10">
            {/* Search Matrix */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group flex-1 w-full max-w-2xl">
                    <div className="absolute inset-0 bg-primary/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-[32px]" />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-all duration-500" />
                    <input
                        placeholder="IDENTIFY CYCLE BY CODED ID, EMAIL, OR IDENTITY..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-8 h-18 rounded-[32px] glass border border-white/5 focus:border-primary/30 focus:outline-none transition-all font-black text-xs uppercase tracking-[0.2em] relative z-10"
                    />
                </div>

                <div className="h-18 px-8 rounded-[32px] glass border border-white/5 flex items-center gap-4 text-foreground/20 shrink-0">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] tabular-nums whitespace-nowrap">
                        {filteredOrders.length} Elements Audited
                    </span>
                </div>
            </div>

            {/* Desktop Table Registry */}
            <div className="hidden md:block overflow-hidden rounded-[48px] border border-white/5 glass shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/2">
                            <th className="px-10 py-8 text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Cycle ID</th>
                            <th className="px-10 py-8 text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Node Identity</th>
                            <th className="px-10 py-8 text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Audit Type</th>
                            <th className="px-10 py-8 text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Net Value</th>
                            <th className="px-10 py-8 text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Status Phase</th>
                            <th className="px-10 py-8 text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] text-right">Endpoint</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <AnimatePresence mode="popLayout">
                            {filteredOrders.map((order) => (
                                <motion.tr
                                    key={order.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="hover:bg-white/3 transition-all duration-300 group"
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                                <Hash className="h-3.5 w-3.5 text-foreground/20" />
                                            </div>
                                            <span className="font-mono text-xs font-black tracking-widest text-foreground group-hover:text-primary transition-colors">{order.order_number}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-primary/40 shrink-0 border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                <User className="h-4.5 w-4.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black uppercase tracking-tight truncate mb-1 leading-none">{order.users.first_name} {order.users.last_name}</p>
                                                <p className="text-[10px] text-foreground/30 font-black uppercase tracking-widest truncate">{order.users.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-8 w-8 rounded-full flex items-center justify-center border transition-all duration-500",
                                                order.type === 'BUY' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20 group-hover:bg-rose-500/20"
                                            )}>
                                                {order.type === 'BUY' ? (
                                                    <ArrowUpRight className="h-4 w-4" />
                                                ) : (
                                                    <ArrowDownLeft className="h-4 w-4" />
                                                )}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{order.type} {order.asset}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-sm font-black tabular-nums tracking-tight mb-1">{order.amount_crypto} {order.asset}</p>
                                        <p className="text-[10px] text-foreground/30 font-black uppercase tracking-widest leading-none">≈ {order.amount_fiat.toLocaleString()} {order.fiat_currency}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="relative isolate group/select">
                                            <Select
                                                disabled={updatingId === order.id}
                                                onValueChange={(val) => handleStatusUpdate(order.id, val)}
                                                defaultValue={order.status}
                                            >
                                                <SelectTrigger
                                                    className={cn(
                                                        "h-10 w-[160px] rounded-2xl border text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all duration-500 active:scale-95",
                                                        getStatusColor(order.status)
                                                    )}
                                                >
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl glass border-white/10 p-2">
                                                    <SelectItem value="PENDING" className="rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest focus:bg-blue-500/10 focus:text-blue-500 mb-1">Pending</SelectItem>
                                                    <SelectItem value="PROCESSING" className="rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest focus:bg-amber-500/10 focus:text-amber-500 mb-1">Processing</SelectItem>
                                                    <SelectItem value="COMPLETED" className="rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest focus:bg-emerald-500/10 focus:text-emerald-500 mb-1">Completed</SelectItem>
                                                    <SelectItem value="CANCELLED" className="rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest focus:bg-rose-500/10 focus:text-rose-500 mb-1">Cancelled</SelectItem>
                                                    <SelectItem value="REFUNDED" className="rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest focus:bg-foreground/10 mb-1">Refunded</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                            <button
                                                onClick={() => copyAddress(order.receiving_address, order.id)}
                                                className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 text-foreground/20 hover:text-primary hover:border-primary/20 transition-all active:scale-90 flex items-center justify-center"
                                                title={order.type === 'BUY' ? "Capture Wallet Matrix" : "Capture Payment Hub"}
                                            >
                                                {copiedId === order.id ? (
                                                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                                                ) : (
                                                    <Copy className="h-4.5 w-4.5" />
                                                )}
                                            </button>
                                            {order.type === 'BUY' && (
                                                <button
                                                    onClick={() => openExplorer(order.receiving_address)}
                                                    className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 text-foreground/20 hover:text-primary hover:border-primary/20 transition-all active:scale-90 flex items-center justify-center"
                                                    title="Audit on Block Explorer"
                                                >
                                                    <ExternalLink className="h-4.5 w-4.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Mobile Registry Grid */}
            <div className="md:hidden space-y-6">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="p-8 rounded-[40px] border border-white/5 glass space-y-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[10px] font-black text-foreground/30 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">#{order.order_number}</span>
                                <div className={cn(
                                    "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border",
                                    order.type === 'BUY' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-rose-500/10 text-rose-500 border-rose-500/10"
                                )}>
                                    {order.type}
                                </div>
                            </div>
                            <Select
                                disabled={updatingId === order.id}
                                onValueChange={(val) => handleStatusUpdate(order.id, val)}
                                defaultValue={order.status}
                            >
                                <SelectTrigger className={cn(
                                    "h-10 w-[140px] rounded-2xl border text-[9px] font-black uppercase tracking-[0.2em]",
                                    getStatusColor(order.status)
                                )}>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="glass border-white/10 rounded-2xl">
                                    <SelectItem value="PENDING">PENDING</SelectItem>
                                    <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                                    <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="relative z-10 flex items-center gap-5 p-6 rounded-[32px] bg-white/3 border border-white/5">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-primary/40 shrink-0">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 space-y-1">
                                <p className="text-base font-black tracking-tight uppercase leading-none truncate">{order.users.first_name} {order.users.last_name}</p>
                                <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.2em] truncate">{order.users.email}</p>
                            </div>
                        </div>

                        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-end gap-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-3.5 w-3.5 text-primary opacity-30" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{order.asset} ALLOCATION</span>
                                </div>
                                <div>
                                    <p className="text-3xl font-black tabular-nums tracking-tighter leading-none mb-1">{order.amount_crypto} <span className="text-lg opacity-30">{order.asset}</span></p>
                                    <p className="text-[11px] text-foreground/30 font-black uppercase tracking-[0.2em]">≈ {order.amount_fiat.toLocaleString()} {order.fiat_currency}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => copyAddress(order.receiving_address, order.id)}
                                    className="h-14 w-14 rounded-2xl glass border border-white/5 text-foreground/30 hover:text-primary transition-all flex items-center justify-center active:scale-90 shadow-2xl"
                                >
                                    {copiedId === order.id ? (
                                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                    ) : (
                                        <Copy className="h-6 w-6" />
                                    )}
                                </button>
                                {order.type === 'BUY' && (
                                    <button
                                        onClick={() => openExplorer(order.receiving_address)}
                                        className="h-14 w-14 rounded-2xl glass border border-white/5 text-foreground/30 hover:text-primary transition-all flex items-center justify-center active:scale-90 shadow-2xl"
                                    >
                                        <ExternalLink className="h-6 w-6" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
