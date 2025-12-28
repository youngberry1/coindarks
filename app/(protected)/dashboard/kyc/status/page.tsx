import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/user';
import { getKYCStatus } from '@/actions/kyc/get-kyc-status';
import { KYCStatusBadge } from '@/components/kyc/KYCStatusBadge';
import { ShieldCheck, Clock, AlertTriangle, Calendar, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function KYCStatusPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const user = await getUserById(session.user.id);
    const { kyc } = await getKYCStatus();

    const status = user?.kycStatus || 'UNVERIFIED';

    // If unverified, redirect to submit page
    if (status === 'UNVERIFIED') {
        redirect('/dashboard/kyc/submit');
    }

    // Define content based on status
    const config = {
        PENDING: {
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
            icon: Clock,
            title: 'Application Under Review',
            description: 'Your KYC application has been received and is currently being reviewed by our compliance team. This process typically takes 24-48 hours.',
        },
        APPROVED: {
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
            icon: ShieldCheck,
            title: 'Verification Complete',
            description: 'Congratulations! Your identity has been verified. You now have full access to all features and increased transaction limits.',
        },
        REJECTED: {
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            icon: AlertTriangle,
            title: 'Application Rejected',
            description: 'Unfortunately, your KYC application was rejected. Please review the reason below and submit a new application with corrected information.',
        },
    }[status as 'PENDING' | 'APPROVED' | 'REJECTED'];

    const StatusIcon = config?.icon || ShieldCheck;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 mb-6">
                <Link href="/dashboard" className="text-sm text-foreground/40 hover:text-primary transition-colors">
                    Dashboard
                </Link>
                <ChevronRight className="w-4 h-4 text-foreground/20" />
                <span className="text-sm font-medium">KYC Status</span>
            </div>

            {/* Status Card */}
            <div className={`rounded-3xl p-8 border ${config?.bg} ${config?.border} relative overflow-hidden`}>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
                    <div className={`w-16 h-16 rounded-2xl ${config?.bg} flex items-center justify-center border ${config?.border}`}>
                        <StatusIcon className={`w-8 h-8 ${config?.color}`} />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold">{config?.title}</h1>
                            <KYCStatusBadge status={status} />
                        </div>
                        <p className="text-foreground/60 max-w-xl">
                            {config?.description}
                        </p>
                    </div>

                    {status === 'REJECTED' && (
                        <Link
                            href="/dashboard/kyc/submit"
                            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg whitespace-nowrap"
                        >
                            Resubmit Application
                        </Link>
                    )}
                    {status === 'APPROVED' && (
                        <Link
                            href="/dashboard"
                            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg whitespace-nowrap"
                        >
                            Start Trading
                        </Link>
                    )}
                </div>

                {/* Rejection Reason */}
                {status === 'REJECTED' && kyc?.rejectionReason && (
                    <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Rejection Reason
                        </h4>
                        <p className="text-sm text-red-400/90 leading-relaxed">
                            {kyc.rejectionReason}
                        </p>
                    </div>
                )}
            </div>

            {/* Application Details */}
            {kyc && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-morphism p-6 rounded-3xl border border-white/5 space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" /> Application Details
                        </h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-foreground/40">Full Name</span>
                                <span className="font-medium">{kyc.fullName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-foreground/40">Date of Birth</span>
                                <span className="font-medium">{new Date(kyc.dob).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-foreground/40">Country</span>
                                <span className="font-medium">{kyc.country}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-foreground/40">ID Type</span>
                                <span className="font-medium replace-underscore">{kyc.idType.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-white/5">
                                <span className="text-foreground/40">ID Number</span>
                                <span className="font-medium">{kyc.idNumber}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-morphism p-6 rounded-3xl border border-white/5 space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" /> Timeline
                        </h3>

                        <div className="space-y-6 relative pl-4 border-l border-white/10 ml-2">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-4 border-background" />
                                <p className="text-sm font-medium">Application Submitted</p>
                                <p className="text-xs text-foreground/40">
                                    {new Date(kyc.submittedAt).toLocaleString()}
                                </p>
                            </div>

                            {kyc.reviewedAt && (
                                <div className="relative">
                                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-4 border-background ${status === 'REJECTED' ? 'bg-red-500' : 'bg-green-500'}`} />
                                    <p className="text-sm font-medium">
                                        {status === 'REJECTED' ? 'Application Rejected' : 'Application Approved'}
                                    </p>
                                    <p className="text-xs text-foreground/40">
                                        {new Date(kyc.reviewedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
