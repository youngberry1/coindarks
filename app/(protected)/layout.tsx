import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { SupportWidget } from "@/components/dashboard/SupportWidget";
import { supabaseAdmin } from "@/lib/supabase-admin";

import { AdminNotificationListener } from "@/components/admin/AdminNotificationListener";

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
        <div className="flex min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Clean Atmosphere Layer */}
            {/* Clean Atmosphere Layer */}
            <div className="hidden md:block fixed inset-0 bg-mesh opacity-[0.08] -z-10" />
            <div className="hidden md:block fixed top-[-10%] right-[-10%] w-[80%] h-[80%] bg-primary/3 blur-[120px] rounded-full -z-10" />
            <div className="hidden md:block fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-secondary/3 blur-[100px] rounded-full -z-10" />

            {/* Sidebar component */}
            <DashboardSidebar user={sidebarUser} />

            {/* Admin Notifications Listener */}
            {isAdmin && <AdminNotificationListener />}

            {/* Main content area */}
            <main className="flex-1 xl:ml-80 relative pt-24 xl:pt-0 min-h-screen overflow-y-auto flex flex-col">
                <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:px-6 md:py-8 2xl:px-10 2xl:py-12 animate-in fade-in duration-700 flex flex-col">
                    {children}
                </div>
            </main>

            {/* Global Support Widget */}
            {!isAdmin && (
                <div className="fixed bottom-8 right-8 z-50">
                    <SupportWidget orders={recentOrders || []} />
                </div>
            )}
        </div>
    );
}
