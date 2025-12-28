import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
    Search,
    Filter,
    MoreVertical,
    ShieldX,
    Mail,
    BadgeCheck,
    History,
    FileSearch
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function UserManagementPage() {
    const session = await auth();
    const role = session?.user?.role;

    if (role !== "ADMIN" && role !== "SUPPORT") {
        redirect("/dashboard");
    }

    const mockUsers = [
        { id: "1", name: "Kwame Mensah", email: "kwame@example.com", role: "USER", status: "ACTIVE", kyc: "APPROVED", compliance: "CLEAN", joined: "Oct 12, 2025" },
        { id: "2", name: "John Doe", email: "john@example.com", role: "USER", status: "SUSPENDED", kyc: "PENDING", compliance: "FLAGGED", joined: "Oct 10, 2025" },
        { id: "3", name: "Sarah Smith", email: "sarah@example.com", role: "ADMIN", status: "ACTIVE", kyc: "APPROVED", compliance: "CLEAN", joined: "Sept 15, 2025" },
        { id: "4", name: "Ebube Okoro", email: "ebube@example.com", role: "USER", status: "ACTIVE", kyc: "UNVERIFIED", compliance: "NEW", joined: "Oct 20, 2025" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">
                        User <span className="text-gradient">Management</span>
                    </h1>
                    <p className="text-foreground/40 font-medium uppercase tracking-[0.2em] text-[10px]">
                        Manage accounts, permissions and compliance
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Find a user..."
                            className="w-full bg-foreground/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <button className="p-2 rounded-xl border border-white/5 hover:bg-foreground/5 transition-all">
                        <Filter className="h-5 w-5 text-foreground/60" />
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-morphism rounded-3xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-foreground/2">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">User</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">Compliance</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">KYC</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mockUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-foreground/2 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold transition-transform group-hover:scale-110">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{user.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Mail className="h-3 w-3 text-foreground/20" />
                                                    <span className="text-[11px] text-foreground/40 font-medium">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-[9px] font-black px-1.5 py-0.5 rounded",
                                                user.compliance === "CLEAN" ? "bg-green-500/10 text-green-500" :
                                                    user.compliance === "FLAGGED" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                            )}>
                                                {user.compliance}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full animate-pulse",
                                                user.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                                            )} />
                                            <span className="text-xs font-bold text-foreground/60">{user.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            {user.kyc === "APPROVED" ? (
                                                <BadgeCheck className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <ShieldX className="h-4 w-4 text-amber-500" />
                                            )}
                                            <span className="text-xs font-medium text-foreground/40 capitalize">{user.kyc.toLowerCase()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 rounded-xl bg-foreground/5 hover:bg-primary hover:text-white text-foreground/40 transition-all" title="View Audit Trail">
                                                <History className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 rounded-xl bg-foreground/5 hover:bg-secondary hover:text-white text-foreground/40 transition-all" title="Inspect Documents">
                                                <FileSearch className="h-4 w-4" />
                                            </button>
                                            <button className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-all">
                                                <MoreVertical className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="px-6 py-4 bg-foreground/1 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs text-foreground/40 font-medium">Showing 4 of 1,284 users</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-white/5 text-xs font-bold text-foreground/20 cursor-not-allowed">Previous</button>
                        <button className="px-3 py-1.5 rounded-lg border border-white/5 text-xs font-bold hover:bg-foreground/5 transition-all">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
