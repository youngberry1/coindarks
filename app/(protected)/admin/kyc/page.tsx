import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/kyc-storage";
import {
    CheckCircle2,
    Clock
} from "lucide-react";
import { KYCReviewList } from "@/components/admin/KYCReviewList";

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">KYC Review Center</h1>
                    <p className="text-foreground/50 font-medium">
                        Review and verify user identity documents for platform security.
                    </p>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest leading-none mb-1">Queue Size</p>
                        <p className="text-sm font-bold">{pendingKYC?.length || 0} Pending</p>
                    </div>
                </div>
            </div>

            {(!pendingKYC || pendingKYC.length === 0) ? (
                <div className="p-20 rounded-[40px] border border-dashed border-white/10 flex flex-col items-center text-center">
                    <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Queue is Clear!</h3>
                    <p className="text-foreground/40 max-w-sm mb-8">All identity verifications have been processed. Great job!</p>
                </div>
            ) : (
                <KYCReviewList submissions={submissionsWithUrls} />
            )}
        </div>
    );
}
