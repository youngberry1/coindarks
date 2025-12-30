"use client";

import { ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VerificationSettingsProps {
    user: {
        kyc_status: string;
        kyc_rejection_reason?: string | null;
    };
}

export function VerificationSettings({ user }: VerificationSettingsProps) {
    const status = user?.kyc_status || 'UNVERIFIED';

    const statusConfig: Record<string, { color: string; label: string; }> = {
        'UNSUBMITTED': {
            color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
            label: 'Unverified'
        },
        'UNVERIFIED': {
            color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
            label: 'Unverified'
        },
        'PENDING': {
            color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
            label: 'Under Review'
        },
        'APPROVED': {
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            label: 'Verified'
        },
        'REJECTED': {
            color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
            label: 'Rejected'
        }
    };

    const currentConfig = statusConfig[status] || statusConfig['UNVERIFIED'];

    return (
        <div className="max-w-2xl space-y-8">
            <div className="p-8 rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <ShieldCheck className={cn("h-5 w-5", status === 'APPROVED' ? 'text-emerald-500' : 'text-primary')} />
                            ID Verification Status
                        </h3>
                        <p className="text-sm text-foreground/40 font-medium italic">Verify your identity to unlock premium features and enhance security.</p>
                    </div>
                    <div className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border", currentConfig.color)}>
                        {currentConfig.label}
                    </div>
                </div>

                {status !== 'APPROVED' && status !== 'PENDING' && (
                    <div className="mt-10 p-6 rounded-3xl bg-primary/5 border border-dashed border-primary/20 flex flex-col items-center text-center">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <h4 className="font-bold mb-2">{status === 'REJECTED' ? 'Recollect Verification' : 'Upgrade to Verified Account'}</h4>
                        <p className="text-sm text-foreground/50 mb-6 max-w-sm">Submit your National ID, Passport or Drivers License for instant approval.</p>
                        <Link href="/dashboard/kyc/submit" className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                            {status === 'REJECTED' ? 'Retake Verification' : 'Start Verification'}
                        </Link>
                    </div>
                )}

                {status === 'PENDING' && (
                    <div className="mt-10 p-6 rounded-3xl bg-amber-500/5 border border-dashed border-amber-500/20 flex flex-col items-center text-center">
                        <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                            <ShieldCheck className="h-8 w-8 text-amber-500" />
                        </div>
                        <h4 className="font-bold mb-2 text-amber-500">Verification Under Review</h4>
                        <p className="text-sm text-foreground/50 mb-0 max-w-sm">
                            Your documents have been submitted and are under review. This usually takes 24-48 hours. You will receive an email once the process is complete.
                        </p>
                    </div>
                )}

                {status === 'REJECTED' && user?.kyc_rejection_reason && (
                    <div className="mt-6 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-center gap-3 text-rose-500">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p className="text-xs font-bold leading-tight">Reason for rejection: {user.kyc_rejection_reason}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
