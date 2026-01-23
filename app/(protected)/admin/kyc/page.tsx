import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/kyc-storage";
import {
    CheckCircle2,
    Clock
} from "lucide-react";
import { KYCReviewList } from "@/components/admin/KYCReviewList";

export const metadata: Metadata = {
    title: "Identity Checks | CoinDarks Admin",
    description: "Institutional identity verification and compliance review.",
};

export default async function AdminKYCPage() {
    const session = await auth();

    // Strict admin check
    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    // Fetch pending KYC submissions using Admin client to bypass RLS
    const { data: pendingKYC } = await supabaseAdmin
        .from('kyc_submissions')
        .select(`
            *,
            users (
                first_name,
                last_name,
                email,
                profile_image
            )
        `)
        .eq('status', 'PENDING')
        .order('submitted_at', { ascending: true });

    // Generate signed URLs for private images using Admin client
    const submissionsWithUrls = await Promise.all((pendingKYC || []).map(async (sub) => {
        const getUrl = async (path: string) => {
            if (!path) return "";
            try {
                // Use supabaseAdmin to bypass RLS for reading private bucket
                const { data } = await supabaseAdmin.storage.from('kyc-documents').createSignedUrl(path, 3600);
                return data?.signedUrl || "";
            } catch (e) {
                console.error("Signed URL Error:", e);
                return "";
            }
        };

        return {
            ...sub,
            frontUrl: await getUrl(sub.document_front),
            backUrl: await getUrl(sub.document_back),
            selfieUrl: await getUrl(sub.selfie),
        };
    }));

    return (
        <div className="space-y-12 sm:space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header / Compliance Focus */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">Security Hub : Identity Checks</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none uppercase">
                        Identity <br />
                        <span className="text-gradient leading-relaxed">Checks.</span>
                    </h1>
                    <p className="text-base sm:text-xl text-foreground/50 font-medium max-w-2xl leading-relaxed">
                        Review of member identity credentials. verify authenticity,
                        audit document correctness, and authorize platform access.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-16 sm:h-20 px-6 sm:px-8 rounded-2xl sm:rounded-3xl glass border border-white/5 flex items-center gap-4 sm:gap-5 shadow-2xl">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em] leading-none mb-1 sm:mb-1.5">Review Queue</p>
                            <p className="text-base sm:text-xl font-black tabular-nums">{pendingKYC?.length || 0} Pending Checks</p>
                        </div>
                    </div>
                </div>
            </div>

            {(!pendingKYC || pendingKYC.length === 0) ? (
                <div className="relative group">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-[64px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="relative p-20 sm:p-32 rounded-[64px] border border-white/5 glass flex flex-col items-center text-center space-y-8">
                        <div className="h-32 w-32 rounded-[40px] bg-primary/5 border border-primary/10 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full" />
                            <CheckCircle2 className="h-16 w-16 text-primary relative z-10" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black uppercase tracking-tight">Queue Synchronized</h3>
                            <p className="text-lg text-foreground/40 max-w-sm font-medium leading-relaxed">
                                All identity check cycles have been successfully processed.
                                The member registry is current.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-10">
                    <KYCReviewList submissions={submissionsWithUrls} />
                </div>
            )}
        </div>
    );
}
