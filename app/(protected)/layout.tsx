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
        <div className="flex min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Atmosphere Layer */}
            <div className="fixed inset-0 bg-mesh opacity-[0.15] -z-10" />
            <div className="fixed top-[-10%] right-[-10%] w-[80%] h-[80%] bg-primary/5 blur-[160px] rounded-full -z-10 animate-pulse-slow" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-secondary/5 blur-[140px] rounded-full -z-10 animate-pulse-slow" />
            <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none -z-10" />

            {/* Sidebar component */}
            <DashboardSidebar user={sidebarUser} />

            {/* Main content area */}
            <main className="flex-1 lg:ml-80 relative pt-24 lg:pt-0 min-h-screen">
                <div className="max-w-7xl mx-auto p-4 md:p-10 lg:p-14 animate-in fade-in duration-700">
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
