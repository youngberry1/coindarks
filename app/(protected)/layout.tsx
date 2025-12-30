import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Fetch latest KYC status and profile image
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('kyc_status, profile_image')
        .eq('id', session.user.id)
        .single();

    const sidebarUser = {
        ...session.user,
        kyc_status: user?.kyc_status || 'UNSUBMITTED',
        profile_image: user?.profile_image
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar component */}
            <DashboardSidebar user={sidebarUser} />

            {/* Main content area */}
            <main className="flex-1 lg:ml-72 relative pt-20 lg:pt-0">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
