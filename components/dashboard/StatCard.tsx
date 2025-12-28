'use client';

import { History, Wallet, LayoutDashboard, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: string;
    subValue: string;
    iconName: 'history' | 'wallet' | 'dashboard';
    color: string;
    bg: string;
}

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
    history: History,
    wallet: Wallet,
    dashboard: LayoutDashboard,
};

export function StatCard({ label, value, subValue, iconName, color, bg }: StatCardProps) {
    const Icon = iconMap[iconName];

    return (
        <div className="glass-morphism p-6 rounded-3xl border border-white/5 group hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110', bg)}>
                    <Icon className={cn('h-6 w-6', color)} />
                </div>
                <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
                    Live Metrics
                </span>
            </div>
            <div>
                <p className="text-sm font-medium text-foreground/40 mb-1">{label}</p>
                <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
                <p className="text-xs text-foreground/20 font-bold mt-2">{subValue}</p>
            </div>
        </div>
    );
}
