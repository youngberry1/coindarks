"use client";

import { useState } from "react";
import {
    ShieldCheck,
    ShieldAlert,
    MoreVertical,
    Ban,
    User as UserIcon,
    Mail,
    Search,
    Shield
} from "lucide-react";
import { toggleUserStatus } from "@/actions/admin";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/modal";

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    kyc_status: string;
    role: string;
    status: string;
    created_at: string;
}

interface UserManagementListProps {
    users: User[];
}

export function UserManagementList({ users }: UserManagementListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleStatus = async () => {
        if (!selectedUser) return;
        setIsLoading(true);
        const newStatus = selectedUser.status === 'BANNED' ? 'ACTIVE' : 'BANNED' as 'ACTIVE' | 'BANNED';

        try {
            const result = await toggleUserStatus(selectedUser.id, newStatus);
            if (result.success) {
                toast.success(result.success);
                setIsBanModalOpen(false);
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Failed to update user status");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                <input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-6 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none transition-all font-bold text-sm"
                />
            </div>

            <div className="overflow-x-auto rounded-[24px] md:rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">User</th>
                            <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">KYC Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Role</th>
                            <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest">Joined</th>
                            <th className="px-8 py-6 text-[10px] font-black text-foreground/40 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-bold">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                                            <UserIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm truncate">{user.first_name} {user.last_name}</p>
                                            <p className="text-[11px] text-foreground/40 flex items-center gap-1 font-medium">
                                                <Mail className="h-3 w-3" /> {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.kyc_status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500" :
                                        user.kyc_status === 'PENDING' ? "bg-amber-500/10 text-amber-500" :
                                            "bg-white/5 text-foreground/30"
                                        }`}>
                                        {user.kyc_status === 'APPROVED' && <ShieldCheck className="h-3 w-3" />}
                                        {user.kyc_status === 'PENDING' && <ShieldAlert className="h-3 w-3 animate-pulse" />}
                                        {user.kyc_status}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? "bg-primary/20 text-primary border border-primary/20" : "bg-white/5 text-foreground/40"
                                        }`}>
                                        {user.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                                        {user.role}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-sm text-foreground/40 font-medium whitespace-nowrap">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setIsBanModalOpen(true);
                                            }}
                                            className={`p-2.5 rounded-xl transition-all ${user.status === 'BANNED'
                                                ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                                : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                                                }`}
                                            title={user.status === 'BANNED' ? "Revoke Ban" : "Ban User"}
                                        >
                                            <Ban className="h-4 w-4" />
                                        </button>
                                        <button className="p-2.5 rounded-xl bg-white/5 text-foreground/40 hover:bg-white/10 transition-all">
                                            <MoreVertical className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={isBanModalOpen}
                onClose={() => setIsBanModalOpen(false)}
                onConfirm={handleToggleStatus}
                isLoading={isLoading}
                title={selectedUser?.status === 'BANNED' ? "Revoke Access Ban?" : "Confirm Account Suspension"}
                description={
                    selectedUser?.status === 'BANNED'
                        ? `Are you sure you want to reactivate ${selectedUser?.email}'s account? They will be able to log in again.`
                        : `Are you sure you want to ban ${selectedUser?.email}? They will be immediately logged out and unable to access their account.`
                }
                confirmText={selectedUser?.status === 'BANNED' ? "Reactivate User" : "Suspend Account"}
                variant={selectedUser?.status === 'BANNED' ? "success" : "destructive"}
            />
        </div>
    );
}
