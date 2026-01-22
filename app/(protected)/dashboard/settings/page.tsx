import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SettingsTabs } from "@/components/dashboard/settings/SettingsTabs";

export const metadata: Metadata = {
    title: "Settings | CoinDarks",
    description: "Manage your account settings and profile.",
};

export default async function SettingsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    // Fetch full user data
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Settings</h1>
                <p className="text-sm md:text-base text-foreground/50 font-medium">Manage your profile and security preferences.</p>
            </div>

            <SettingsTabs
                user={userData}
                role={session.user.role}
            />
        </div>
    );
}
