"use client";

import { useState } from "react";
import {
    ShieldCheck,
    Ban,
    User as UserIcon,
    Mail,
    Search,
    Shield,
    Copy,
    MoreHorizontal,
    Eye,
    Activity,
    X
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
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
        <div className="space-y-10">
            {/* Search Matrix */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group flex-1 w-full max-w-2xl">
                    <div className="absolute inset-0 bg-primary/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-[32px]" />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50 group-focus-within:text-primary transition-all duration-500 z-20" />
                    <input
                        placeholder="SEARCH MEMBERS BY NAME OR EMAIL..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-16 h-18 rounded-[32px] glass border border-white/5 focus:border-primary/30 focus:outline-none transition-all font-black text-xs uppercase tracking-[0.2em] relative z-10"
                    />
                    <AnimatePresence>
                        {searchTerm && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => setSearchTerm("")}
                                className="absolute right-6 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-foreground/40 hover:bg-white/10 hover:text-white transition-all z-20"
                            >
                                <X className="h-4 w-4" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-18 px-8 rounded-[32px] glass border border-white/5 flex items-center gap-4 text-foreground/20 shrink-0">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] tabular-nums whitespace-nowrap">
                        {filteredUsers.length} Members Found
                    </span>
                </div>
            </div>

            {/* Desktop Table Registry */}
            <div className="hidden lg:block overflow-hidden rounded-[48px] border border-white/5 glass shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/2">
                            <th className="px-10 py-8 text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Profile</th>
                            <th className="px-10 py-8 text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Verification Status</th>
                            <th className="px-10 py-8 text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Role / Access</th>
                            <th className="px-10 py-8 text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Join Date</th>
                            <th className="px-10 py-8 text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <AnimatePresence mode="popLayout">
                            {filteredUsers.map((user) => (
                                <motion.tr
                                    key={user.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="hover:bg-white/3 transition-all duration-300 group"
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-primary shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 relative overflow-hidden shadow-2xl">
                                                {user.profile_image ? (
                                                    <Image
                                                        src={user.profile_image}
                                                        alt={user.first_name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <span className="font-black text-xl">{user.first_name?.[0]}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-base font-black tracking-tight group-hover:text-primary transition-colors uppercase leading-none mb-1.5">{user.first_name} {user.last_name}</p>
                                                <p className="text-[10px] text-foreground/30 flex items-center gap-2 font-black uppercase tracking-widest">
                                                    <Mail className="h-3 w-3" /> {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        {user.role === 'ADMIN' ? (
                                            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500 bg-primary/10 text-primary border-primary/20">
                                                <ShieldCheck className="h-3.5 w-3.5" />
                                                System Exempt
                                            </div>
                                        ) : (
                                            <div className={cn(
                                                "inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500",
                                                user.kyc_status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500/20" :
                                                    user.kyc_status === 'PENDING' ? "bg-amber-500/10 text-amber-500 border-amber-500/20 group-hover:bg-amber-500/20" :
                                                        "bg-white/5 text-foreground/20 border-white/5"
                                            )}>
                                                {user.kyc_status === 'APPROVED' && <ShieldCheck className="h-3.5 w-3.5" />}
                                                {user.kyc_status === 'PENDING' && <Activity className="h-3.5 w-3.5 animate-pulse" />}
                                                {user.kyc_status === 'UNSUBMITTED' ? 'Awaiting Submission' : user.kyc_status}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className={cn(
                                            "inline-flex items-center gap-2.5 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border",
                                            user.role === 'ADMIN' ? "bg-primary/20 text-primary border-primary/30" : "glass border-white/5 text-foreground/30"
                                        )}>
                                            {user.role === 'ADMIN' ? <Shield className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-sm text-foreground/30 font-black tabular-nums tracking-widest whitespace-nowrap uppercase">
                                        {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                            {user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsBanModalOpen(true);
                                                    }}
                                                    className={cn(
                                                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 active:scale-95",
                                                        user.status === 'BANNED'
                                                            ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20"
                                                            : "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                                                    )}
                                                    title={user.status === 'BANNED' ? "Activate Member" : "De-activate Member"}
                                                >
                                                    <Ban className="h-5 w-5" />
                                                </button>
                                            )}

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 text-foreground/40 hover:bg-white/10 hover:border-white/10 transition-all active:scale-95 flex items-center justify-center"
                                                    >
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[200px] p-2 rounded-3xl glass backdrop-blur-3xl border-white/10">
                                                    <DropdownMenuLabel className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                                                        {user.role === 'ADMIN' ? 'Administrative Controls' : 'Member Controls'}
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuItem asChild className="rounded-2xl h-12 mb-1 px-3 current-shadow focus:bg-primary transition-colors cursor-pointer">
                                                        <Link href={`/admin/users/${user.id}`} className="flex items-center w-full">
                                                            <Eye className="mr-3 h-4 w-4" />
                                                            <span className="font-black text-xs uppercase tracking-tight">View Profile</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-2xl h-12 mb-1 px-3 focus:bg-white/10 transition-colors cursor-pointer"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(user.id);
                                                            toast.success(user.role === 'ADMIN' ? "Admin ID Copied" : "Member ID Copied");
                                                        }}
                                                    >
                                                        <Copy className="mr-3 h-4 w-4" />
                                                        <span className="font-black text-xs uppercase tracking-tight">Copy {user.role === 'ADMIN' ? 'Admin ID' : 'Member ID'}</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-2xl h-12 mb-1 px-3 focus:bg-primary transition-colors cursor-pointer"
                                                        onClick={() => {
                                                            setEmailTarget({
                                                                id: user.id,
                                                                name: `${user.first_name} ${user.last_name}`,
                                                                email: user.email
                                                            });
                                                            setIsEmailModalOpen(true);
                                                        }}
                                                    >
                                                        <Mail className="mr-3 h-4 w-4" />
                                                        <span className="font-black text-xs uppercase tracking-tight">Send Email</span>
                                                    </DropdownMenuItem>
                                                    {user.role !== 'ADMIN' && (
                                                        <>
                                                            <DropdownMenuSeparator className="bg-white/5 my-2" />
                                                            <DropdownMenuItem
                                                                className={cn(
                                                                    "rounded-2xl h-12 px-3 transition-colors cursor-pointer font-black text-xs uppercase tracking-tight",
                                                                    user.status === 'BANNED' ? "text-emerald-500 focus:bg-emerald-500/20" : "text-red-500 focus:bg-red-500/20"
                                                                )}
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setIsBanModalOpen(true);
                                                                }}
                                                            >
                                                                <Ban className="mr-3 h-4 w-4" />
                                                                {user.status === 'BANNED' ? "Activate Member" : "De-activate Member"}
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Mobile/Tablet Registry Grid */}
            <div className="lg:hidden space-y-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] border border-white/5 glass space-y-4 sm:space-y-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl sm:rounded-[20px] bg-white/5 border border-white/5 flex items-center justify-center text-primary shrink-0 relative overflow-hidden shadow-2xl">
                                    {user.profile_image ? (
                                        <Image
                                            src={user.profile_image}
                                            alt={user.first_name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="font-black text-xl sm:text-2xl">{user.first_name?.[0]}</span>
                                    )}
                                </div>
                                <div className="min-w-0 space-y-0.5 sm:space-y-1">
                                    <p className="text-sm sm:text-base font-black tracking-tight uppercase leading-none">{user.first_name} {user.last_name}</p>
                                    <p className="text-[9px] sm:text-[10px] text-foreground/30 font-black uppercase tracking-[0.2em] truncate">{user.email}</p>
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center active:scale-95 transition-all">
                                        <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5 opacity-40" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[180px] p-2 glass backdrop-blur-3xl border-white/10 rounded-2xl">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/users/${user.id}`} className="cursor-pointer">
                                            <Eye className="mr-3 h-4 w-4" />
                                            <span className="font-black text-[10px] uppercase tracking-widest">View Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                        navigator.clipboard.writeText(user.id);
                                        toast.success("ID Copied");
                                    }}>
                                        <Copy className="mr-3 h-4 w-4" />
                                        <span className="font-black text-[10px] uppercase tracking-widest">Copy ID</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] bg-white/3 border border-white/5">
                            <div className="space-y-1 sm:space-y-1.5">
                                <p className="text-[8px] sm:text-[9px] text-foreground/30 font-black uppercase tracking-[0.2em]">Verification</p>
                                {user.role === 'ADMIN' ? (
                                    <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl bg-primary/10 text-primary border-primary/10">
                                        System Exempt
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl",
                                        user.kyc_status === 'APPROVED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" :
                                            user.kyc_status === 'PENDING' ? "bg-amber-500/10 text-amber-500 border-amber-500/10" :
                                                "bg-white/5 text-foreground/20 border-white/5"
                                    )}>
                                        {user.kyc_status}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1 sm:space-y-1.5">
                                <p className="text-[8px] sm:text-[9px] text-foreground/30 font-black uppercase tracking-[0.2em]">Role / Access</p>
                                <div className={cn(
                                    "inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl",
                                    user.role === 'ADMIN' ? "bg-primary/20 text-primary border-primary/20" : "bg-white/5 text-foreground/30"
                                )}>
                                    {user.role}
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center justify-between">
                            <p className="text-[9px] sm:text-[10px] text-foreground/20 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                            {user.role !== 'ADMIN' && (
                                <button
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setIsBanModalOpen(true);
                                    }}
                                    className={cn(
                                        "h-10 sm:h-11 px-4 sm:px-5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-300",
                                        user.status === 'BANNED'
                                            ? "bg-emerald-500 text-white border-emerald-500/30"
                                            : "bg-red-500/10 text-red-500 border-red-500/20"
                                    )}
                                >
                                    {user.status === 'BANNED' ? "Activate" : "De-activate"}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={isBanModalOpen}
                onClose={() => setIsBanModalOpen(false)}
                onConfirm={handleToggleStatus}
                isLoading={isLoading}
                title={selectedUser?.status === 'BANNED' ? "Activate Member?" : "De-activate Member?"}
                description={
                    selectedUser?.status === 'BANNED'
                        ? `Are you sure you want to re-activate ${selectedUser?.email}'s account and restore their access to the platform?`
                        : `Are you sure you want to de-activate ${selectedUser?.email}'s account? This will restrict their access to the platform.`
                }
                confirmText={selectedUser?.status === 'BANNED' ? "Activate Member" : "De-activate Member"}
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
