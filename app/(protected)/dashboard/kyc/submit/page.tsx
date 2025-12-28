import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/user';
import { KYCSubmissionForm } from '@/components/kyc/KYCSubmissionForm';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function KYCSubmitPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const user = await getUserById(session.user.id);
    const kycStatus = user?.kycStatus || 'UNVERIFIED';

    // Redirect logic based on status
    // 1. If APPROVED -> Redirect to Dashboard or Status page
    // 2. If PENDING -> Redirect to Status page (cannot resubmit while pending)
    // 3. If REJECTED or UNVERIFIED -> Show form (allow resubmission)

    if (kycStatus === 'APPROVED') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-12 h-12 text-green-500" />
                </div>
                <h1 className="text-3xl font-black">You are already verified!</h1>
                <p className="text-foreground/60 max-w-md">
                    Your Know Your Customer (KYC) verification is complete. You have full access to all features and higher limits.
                </p>
                <div className="flex gap-4">
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors font-bold text-sm"
                    >
                        Back to Dashboard
                    </Link>
                    <Link
                        href="/dashboard/kyc/status"
                        className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-bold text-sm"
                    >
                        View Status
                    </Link>
                </div>
            </div>
        );
    }

    if (kycStatus === 'PENDING') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-12 h-12 text-yellow-500" />
                </div>
                <h1 className="text-3xl font-black">Verification in Progress</h1>
                <p className="text-foreground/60 max-w-md">
                    We are currently reviewing your documents. This process usually takes 24-48 hours. We will notify you via email once completed.
                </p>
                <Link
                    href="/dashboard/kyc/status"
                    className="px-8 py-3 bg-yellow-500 text-black rounded-xl hover:scale-[1.02] transition-all font-bold text-sm shadow-lg shadow-yellow-500/20"
                >
                    Check Status
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="text-center space-y-4 mb-10">
                <h1 className="text-4xl font-black tracking-tight">
                    Identity <span className="text-gradient">Verification</span>
                </h1>
                <p className="text-foreground/40 max-w-lg mx-auto">
                    Complete the form below to verify your identity. This helps us ensure the security of your account and comply with regulations.
                </p>
            </div>

            {kycStatus === 'REJECTED' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex gap-4 items-start mb-8 animate-in shake">
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-red-500 mb-1">Previous Application Rejected</h3>
                        <p className="text-sm text-red-400/80 mb-4">
                            Your previous KYC application was rejected. Please review your information and submit clearer documents.
                        </p>
                        <Link href="/dashboard/kyc/status" className="text-xs font-bold text-red-500 hover:underline">
                            View Rejection Reason →
                        </Link>
                    </div>
                </div>
            )}

            {/* Submission Form */}
            <KYCSubmissionForm />
        </div>
    );
}
