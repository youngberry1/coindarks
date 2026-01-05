import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { SupportWidget } from "@/components/dashboard/SupportWidget";

import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const sessionUser = session?.user;

    if (!session || !sessionUser) {
        redirect("/login");
    }

    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('kyc_status, profile_image')
        .eq('id', sessionUser.id)
        .single();

    const isAdmin = sessionUser.role === "ADMIN";

    // Fetch recent orders for support context
    const { data: recentOrders } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, asset, amount_crypto')
        .eq('user_id', sessionUser.id)
        .order('created_at', { ascending: false })
        .limit(5);

    const sidebarUser = {
        ...sessionUser,
        kyc_status: userData?.kyc_status || 'UNSUBMITTED',
        profile_image: userData?.profile_image
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

            {/* Global Support Widget */}
            {!isAdmin && <SupportWidget orders={recentOrders || []} />}
        </div>
    );
}
