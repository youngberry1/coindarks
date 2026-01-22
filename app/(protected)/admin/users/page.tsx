import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/kyc-storage";
import { Users as UsersIcon } from "lucide-react";
import { UserManagementList } from "@/components/admin/UserManagementList";

export const metadata: Metadata = {
    title: "Registry Base | CoinDarks Admin",
    description: "Institutional oversight of platform users and access levels.",
};

export default async function AdminUsersPage() {
    const session = await auth();

    // Strict admin check
    if (session?.user?.role !== "ADMIN") {
        redirect("/dashboard");
    }

    // Fetch all users using Admin client to bypass RLS
    const { data: users } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-12 sm:space-y-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header / Command Focus */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">Master Registry : Global User Base</span>
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none uppercase">
                        Registry <br />
                        <span className="text-gradient leading-relaxed">Base.</span>
                    </h1>
                    <p className="text-xl text-foreground/50 font-medium max-w-2xl leading-relaxed">
                        Comprehensive management of the institutional identity registry. monitor active nodes,
                        control access ciphers, and audit regional on-boarding.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-14 px-6 rounded-2xl glass border border-white/5 flex items-center gap-3 text-foreground/30">
                        <UsersIcon className="h-5 w-5" />
                        <span className="text-xs font-black uppercase tracking-widest">{users?.length || 0} Registered Nodes</span>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-10">
                {users && <UserManagementList users={users} />}
            </div>
        </div>
    );
}
