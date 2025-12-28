'use client';

import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { KYCStatus } from '@/types/db';

interface KYCCardProps {
    kycStatus: KYCStatus;
    userName: string;
}

export function KYCCard({ kycStatus, userName }: KYCCardProps) {
    // Determine card content based on KYC status
    const getCardContent = () => {
        switch (kycStatus) {
            case 'APPROVED':
                return {
                    title: 'Verification Complete',
                    description: `Congratulations ${userName}! Your account is fully verified with enhanced trading limits.`,
                    buttonText: 'View Benefits',
                    buttonHref: '/dashboard/kyc/status',
                    bgColor: 'bg-green-500/5',
                    borderColor: 'border-green-500/20',
                };

            case 'PENDING':
                return {
                    title: 'Verification Pending',
                    description: 'Your KYC submission is under review. We typically review applications within 24-48 hours.',
                    buttonText: 'Check Status',
                    buttonHref: '/dashboard/kyc/status',
                    bgColor: 'bg-yellow-500/5',
                    borderColor: 'border-yellow-500/20',
                };

            case 'REJECTED':
                return {
                    title: 'Verification Required',
                    description: 'Your previous submission was rejected. Please review the feedback and resubmit.',
                    buttonText: 'Resubmit KYC',
                    buttonHref: '/dashboard/kyc/submit',
                    bgColor: 'bg-red-500/5',
                    borderColor: 'border-red-500/20',
                };

            default: // UNVERIFIED
                return {
                    title: 'Verification Centre',
                    description: 'Upgrade your security and increase your daily limits by completing KYC.',
                    buttonText: 'Start Verification',
                    buttonHref: '/dashboard/kyc/submit',
                    bgColor: 'bg-primary/5',
                    borderColor: 'border-white/5',
                };
        }
    };

    const content = getCardContent();

    return (
        <div className={`glass-morphism rounded-3xl p-8 border ${content.borderColor} ${content.bgColor} relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <ShieldCheck className="h-24 w-24 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 relative z-10">{content.title}</h3>
            <p className="text-foreground/60 mb-8 text-sm leading-relaxed relative z-10">
                {content.description}
            </p>
            <Link
                href={content.buttonHref}
                className="block w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center relative z-10"
            >
                {content.buttonText}
            </Link>
        </div>
    );
}
