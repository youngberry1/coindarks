import { cn } from '@/lib/utils';
import { Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { KYCStatus } from '@/types/db';

interface KYCStatusBadgeProps {
    status: KYCStatus;
    className?: string;
    showIcon?: boolean;
}

export function KYCStatusBadge({ status, className, showIcon = true }: KYCStatusBadgeProps) {
    const config = {
        UNVERIFIED: {
            label: 'Unverified',
            color: 'text-gray-400',
            bg: 'bg-gray-400/10',
            border: 'border-gray-400/20',
            icon: Shield,
        },
        PENDING: {
            label: 'Pending Review',
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10',
            border: 'border-yellow-400/20',
            icon: Clock,
        },
        APPROVED: {
            label: 'Verified',
            color: 'text-green-400',
            bg: 'bg-green-400/10',
            border: 'border-green-400/20',
            icon: CheckCircle,
        },
        REJECTED: {
            label: 'Rejected',
            color: 'text-red-400',
            bg: 'bg-red-400/10',
            border: 'border-red-400/20',
            icon: XCircle,
        },
    };

    const { label, color, bg, border, icon: Icon } = config[status] || config.UNVERIFIED;

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border antialiased',
                color,
                bg,
                border,
                className
            )}
        >
            {showIcon && <Icon className="w-3.5 h-3.5" />}
            <span>{label}</span>
        </div>
    );
}
