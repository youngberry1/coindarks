import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { KYCForm } from "@/components/dashboard/kyc/KYCForm";

export default async function KYCSubmitPage() {
    const session = await auth();
    if (!session) redirect("/login");

    if (session.user.role === "ADMIN") {
        redirect("/admin/kyc");
    }

    // Fetch latest KYC status directly from DB for the most reliable check
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('kyc_status')
        .eq('id', session.user.id)
        .single();

    const status = user?.kyc_status || 'UNVERIFIED';

    // If already verified or pending, redirect back to dashboard
    if (status === 'APPROVED' || status === 'PENDING') {
        redirect("/dashboard");
    }

    return <KYCForm />;
}
