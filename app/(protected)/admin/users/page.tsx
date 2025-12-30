import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/kyc-storage";
import {
    Search
} from "lucide-react";
import { UserManagementList } from "@/components/admin/UserManagementList";

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">User Directory</h1>
                    <p className="text-foreground/50 font-medium">
                        Manage platform users, monitor activity and control access levels.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                        <input
                            placeholder="Search by name or email..."
                            className="pl-11 pr-6 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none transition-all font-bold text-sm w-64 lg:w-80"
                        />
                    </div>
                </div>
            </div>

            {users && <UserManagementList users={users} />}
        </div>
    );
}
