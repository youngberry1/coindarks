'use client';

import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Activity {
    type: 'buy' | 'sell';
    asset: string;
    amount: string;
    date: string;
    status: string;
}

interface RecentActivityProps {
    activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <div className="lg:col-span-2 glass-morphism rounded-3xl p-8 border border-white/5">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold">Recent Activity</h3>
                    <p className="text-xs text-foreground/40 font-medium uppercase tracking-wider mt-1">
                        Transaction History
                    </p>
                </div>
                <Link
                    href="/dashboard/orders"
                    className="text-xs font-bold text-primary hover:underline transition-all"
                >
                    View All
                </Link>
            </div>

            <div className="space-y-4">
                {activities.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-foreground/40 text-sm">No recent activity</p>
                        <p className="text-foreground/20 text-xs mt-2">Your transactions will appear here</p>
                    </div>
                ) : (
                    activities.map((activity, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-4 rounded-2xl bg-foreground/5 border border-white/5 hover:bg-foreground/10 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={cn(
                                        'h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12',
                                        activity.type === 'buy'
                                            ? 'bg-green-500/10 text-green-500'
                                            : 'bg-red-500/10 text-red-500'
                                    )}
                                >
                                    {activity.type === 'buy' ? (
                                        <ArrowDownLeft className="h-6 w-6" />
                                    ) : (
                                        <ArrowUpRight className="h-6 w-6" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-bold">
                                        Exchange {activity.asset} → GHS
                                    </p>
                                    <p className="text-xs text-foreground/40 font-medium lowercase tracking-wide">
                                        {activity.date}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p
                                    className={cn(
                                        'text-sm font-black',
                                        activity.type === 'buy' ? 'text-green-500' : 'text-foreground'
                                    )}
                                >
                                    {activity.amount}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">
                                    {activity.status}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
