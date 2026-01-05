"use client";

import { useState } from "react";
import {
    ShieldCheck,
    ShieldAlert,
    Ban,
    User as UserIcon,
    Mail,
    Search,
    Shield,
    Copy,
    MoreHorizontal,
    Eye
} from "lucide-react";
import Image from "next/image";
import { toggleUserStatus } from "@/actions/admin";
import Link from "next/link";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DirectEmailModal } from "./DirectEmailModal";

interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    kyc_status: string;
    role: string;
    status: string;
    profile_image?: string | null;
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
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailTarget, setEmailTarget] = useState<{ id: string, name: string, email: string } | null>(null);

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
                    aria-label="Search users by name or email"
                    className="w-full pl-11 pr-6 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none transition-all font-bold text-sm"
                />
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md">
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
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110 relative overflow-hidden">
                                            {user.profile_image ? (
                                                <Image
                                                    src={user.profile_image}
                                                    alt={user.first_name}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <UserIcon className="h-5 w-5" />
                                            )}
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
                                            <Ban className="h-4 w-4" aria-hidden="true" />
                                        </button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className="p-2.5 rounded-xl bg-white/5 text-foreground/40 hover:bg-white/10 transition-all focus:outline-none"
                                                    aria-label="User actions"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/users/${user.id}`} className="cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(user.id);
                                                        toast.success("User ID copied to clipboard");
                                                    }}
                                                >
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy ID
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEmailTarget({
                                                            id: user.id,
                                                            name: `${user.first_name} ${user.last_name}`,
                                                            email: user.email
                                                        });
                                                        setIsEmailModalOpen(true);
                                                    }}
                                                >
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Email User
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className={user.status === 'BANNED' ? "text-emerald-500" : "text-red-500"}
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsBanModalOpen(true);
                                                    }}
                                                >
                                                    <Ban className="mr-2 h-4 w-4" />
                                                    {user.status === 'BANNED' ? "Activate" : "Ban User"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="p-6 rounded-[28px] border border-white/5 bg-card-bg/50 backdrop-blur-md space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 relative overflow-hidden">
                                    {user.profile_image ? (
                                        <Image
                                            src={user.profile_image}
                                            alt={user.first_name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <UserIcon className="h-5 w-5" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold truncate">{user.first_name} {user.last_name}</p>
                                    <p className="text-[10px] text-foreground/40 font-medium truncate">{user.email}</p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-2.5 rounded-xl bg-white/5 text-foreground/40 hover:bg-white/10 transition-all focus:outline-none">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[160px]">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/users/${user.id}`}>
                                            <Eye className="mr-2 h-4 w-4" /> View Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        navigator.clipboard.writeText(user.id);
                                        toast.success("User ID copied");
                                    }}>
                                        <Copy className="mr-2 h-4 w-4" /> Copy ID
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                            <div>
                                <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mb-1.5">KYC Status</p>
                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${user.kyc_status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500" :
                                    user.kyc_status === 'PENDING' ? "bg-amber-500/10 text-amber-500" :
                                        "bg-white/5 text-foreground/30"
                                    }`}>
                                    {user.kyc_status}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-foreground/40 font-black uppercase tracking-widest mb-1.5">Role</p>
                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? "bg-primary/20 text-primary border border-primary/20" : "bg-white/5 text-foreground/40"
                                    }`}>
                                    {user.role}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-[10px] text-foreground/40 font-medium">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                            <button
                                onClick={() => {
                                    setSelectedUser(user);
                                    setIsBanModalOpen(true);
                                }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.status === 'BANNED'
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-red-500/10 text-red-500"
                                    }`}
                            >
                                {user.status === 'BANNED' ? "Activate" : "Ban User"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={isBanModalOpen}
                onClose={() => setIsBanModalOpen(false)}
                onConfirm={handleToggleStatus}
                isLoading={isLoading}
                title={selectedUser?.status === 'BANNED' ? "Revoke Access Ban?" : "Confirm Account Ban"}
                description={
                    selectedUser?.status === 'BANNED'
                        ? `Are you sure you want to reactivate ${selectedUser?.email}'s account? They will be able to log in again.`
                        : `Are you sure you want to ban ${selectedUser?.email}? They will be immediately logged out and unable to access their account.`
                }
                confirmText={selectedUser?.status === 'BANNED' ? "Reactivate User" : "Confirm Ban"}
                variant={selectedUser?.status === 'BANNED' ? "success" : "destructive"}
            />

            <DirectEmailModal
                isOpen={isEmailModalOpen}
                onClose={() => {
                    setIsEmailModalOpen(false);
                    setEmailTarget(null);
                }}
                user={emailTarget}
            />
        </div>
    );
}
