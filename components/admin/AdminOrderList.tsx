"use client";

import { useState } from "react";
import {
    ArrowUpRight,
    ArrowDownLeft,
    User,
    Copy,
    ExternalLink,
    Search
} from "lucide-react";
import { updateOrderStatus } from "@/actions/admin";
import { toast } from "sonner";
import { Loading } from "@/components/ui/Loading";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const result = await updateOrderStatus(orderId, newStatus as OrderStatus);
            if (result.success) {
                toast.success(result.success);
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

    const copyAddress = (address: string) => {
        navigator.clipboard.writeText(address);
        toast.success("Address copied to clipboard");
    };

    const filteredOrders = orders.filter(o =>
        o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.users.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.users.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.users.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                <input
                    placeholder="Search by CD-XXXX, email, or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-6 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none transition-all font-bold text-sm"
                />
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Order #</th>
                                <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">User</th>
                                <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Type / Asset</th>
                                <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest text-right">Fulfillment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-bold">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <span className="font-mono text-sm">{order.order_number}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-foreground/40" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm truncate leading-tight">{order.users.first_name} {order.users.last_name}</p>
                                                <p className="text-[10px] text-foreground/20 font-medium truncate">{order.users.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            {order.type === 'BUY' ? (
                                                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                                            ) : (
                                                <ArrowDownLeft className="h-3.5 w-3.5 text-rose-500" />
                                            )}
                                            <span className="text-xs uppercase tracking-wider">{order.type} {order.asset}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm leading-tight">{order.amount_crypto} {order.asset}</p>
                                        <p className="text-[10px] text-foreground/40 font-medium">≈ {order.amount_fiat} {order.fiat_currency}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="relative inline-block">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                disabled={updatingId === order.id}
                                                className={cn(
                                                    "bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all",
                                                    order.status === 'COMPLETED' ? "text-emerald-500 border-emerald-500/20" :
                                                        order.status === 'CANCELLED' ? "text-rose-500 border-rose-500/20" :
                                                            order.status === 'PROCESSING' ? "text-amber-500 border-amber-500/20" :
                                                                "text-primary border-primary/20"
                                                )}
                                            >
                                                <option value="PENDING">PENDING</option>
                                                <option value="PROCESSING">PROCESSING</option>
                                                <option value="COMPLETED">COMPLETED</option>
                                                <option value="CANCELLED">CANCELLED</option>
                                                <option value="REFUNDED">REFUNDED</option>
                                            </select>
                                            <AnimatePresence>
                                                {updatingId === order.id && (
                                                    <Loading message="Applying state transition..." fullScreen={false} />
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => copyAddress(order.receiving_address)}
                                                className="p-2 rounded-lg bg-white/5 text-foreground/20 hover:text-foreground hover:bg-white/10 transition-all border border-white/5 group/btn"
                                                title="Copy Receiving Address"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                            <button className="p-2 rounded-lg bg-white/5 text-foreground/20 hover:text-foreground hover:bg-white/10 transition-all border border-white/5">
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="p-6 rounded-[28px] border border-white/5 bg-card-bg/50 backdrop-blur-md space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-foreground/40 bg-white/5 px-2 py-1 rounded-md">#{order.order_number}</span>
                            <div className="relative inline-block">
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                    disabled={updatingId === order.id}
                                    className={cn(
                                        "bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all",
                                        order.status === 'COMPLETED' ? "text-emerald-500 border-emerald-500/20" :
                                            order.status === 'CANCELLED' ? "text-rose-500 border-rose-500/20" :
                                                order.status === 'PROCESSING' ? "text-amber-500 border-amber-500/20" :
                                                    "text-primary border-primary/20"
                                    )}
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="PROCESSING">PROCESSING</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                    <option value="REFUNDED">REFUNDED</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-2 border-y border-white/5">
                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 text-foreground/30" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{order.users.first_name} {order.users.last_name}</p>
                                <p className="text-[10px] text-foreground/40 font-medium truncate">{order.users.email}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    {order.type === 'BUY' ? (
                                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                                    ) : (
                                        <ArrowDownLeft className="h-3 w-3 text-rose-500" />
                                    )}
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{order.type} {order.asset}</span>
                                </div>
                                <p className="text-base font-black leading-none">{order.amount_crypto} {order.asset}</p>
                                <p className="text-[10px] text-foreground/40 font-bold tracking-tight">≈ {order.amount_fiat} {order.fiat_currency}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyAddress(order.receiving_address)}
                                    className="p-3 rounded-xl bg-white/5 text-foreground/30 hover:text-primary transition-all border border-white/5"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                                <button className="p-3 rounded-xl bg-white/5 text-foreground/30 hover:text-primary transition-all border border-white/5">
                                    <ExternalLink className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
