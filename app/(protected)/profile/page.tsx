import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { User as UserIcon, Shield, UserCheck, Mail, Calendar, Fingerprint, Trash2, KeyRound } from "lucide-react";
import { getUserById } from "@/lib/user";
import { format } from "date-fns";

export default async function ProfilePage() {
    const session = await auth();

    if (!session || !session.user?.id) {
        redirect("/login");
    }

    const dbUser = await getUserById(session.user.id);

    if (!dbUser) {
        redirect("/login");
    }

    const kycColors = {
        UNVERIFIED: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
        PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        APPROVED: "bg-green-500/10 text-green-500 border-green-500/20",
        REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gradient">Account Settings</h1>
                <p className="text-foreground/60 font-medium">Manage your personal bridge between crypto and local fiat</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Profile Info */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Identity Card */}
                    <div className="glass-morphism rounded-[32px] p-8 border border-card-border overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <UserIcon className="h-32 w-32" />
                        </div>

                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-primary" />
                            </div>
                            Personal Profile
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Legal Name</label>
                                <div className="p-4 rounded-2xl bg-foreground/5 border border-card-border font-bold text-foreground/90">
                                    {dbUser.firstName} {dbUser.middleName} {dbUser.lastName}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Email Identifier</label>
                                <div className="p-4 rounded-2xl bg-foreground/5 border border-card-border font-bold text-foreground/90 flex items-center justify-between">
                                    <span className="truncate mr-2">{dbUser.email}</span>
                                    {dbUser.emailVerified && (
                                        <span className="flex items-center gap-1.5 text-[10px] bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20 font-black">
                                            <UserCheck className="h-3 w-3" /> VERIFIED
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Account Role</label>
                                <div className="p-4 rounded-2xl bg-foreground/5 border border-card-border font-bold text-foreground/90 flex items-center gap-2">
                                    <Fingerprint className="h-4 w-4 text-primary" />
                                    {dbUser.role}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Joined Since</label>
                                <div className="p-4 rounded-2xl bg-foreground/5 border border-card-border font-bold text-foreground/90 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-secondary" />
                                    {dbUser.createdAt ? format(new Date(dbUser.createdAt), "MMMM dd, yyyy") : "N/A"}
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex gap-4 relative z-10">
                            <button className="px-8 py-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Security & Access */}
                    <div className="glass-morphism rounded-[32px] p-8 border border-card-border">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-secondary" />
                            </div>
                            Security & Privacy
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <button className="flex items-center justify-between p-6 rounded-3xl bg-foreground/5 border border-card-border hover:bg-foreground/10 transition-all text-left group">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <KeyRound className="h-5 w-5 text-foreground/60" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Change Password</p>
                                        <p className="text-xs text-foreground/40">Secure your bridge with a new key</p>
                                    </div>
                                </div>
                            </button>

                            <button className="flex items-center justify-between p-6 rounded-3xl bg-red-500/2 border border-red-500/10 hover:bg-red-500/5 transition-all text-left group">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform text-red-500">
                                        <Trash2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-red-500">Deactivate Account</p>
                                        <p className="text-xs text-red-500/40">Request compliant data deletion</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Verification & Status */}
                <div className="space-y-8">
                    {/* KYC Status Card */}
                    <div className="glass-morphism rounded-[32px] p-8 border border-card-border overflow-hidden relative">
                        {/* Background subtle glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -z-10" />

                        <h3 className="text-lg font-bold mb-6">Verification Hub</h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-foreground/5 border border-card-border">
                                <span className="text-xs font-bold text-foreground/60 uppercase tracking-widest">KYC Level</span>
                                <span className={`flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-full border font-black ${kycColors[dbUser.kycStatus as keyof typeof kycColors] || kycColors.UNVERIFIED}`}>
                                    {dbUser.kycStatus || "UNVERIFIED"}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 rounded-[24px] bg-primary/5 border border-primary/10 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <p className="text-sm font-extrabold mb-1">Boost Your Limits</p>
                                        <p className="text-xs text-foreground/60 leading-relaxed mb-4">Complete your identity verification to unlock $10,000+ daily volume.</p>
                                        <button className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                                            Start Verification
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 rounded-[24px] bg-foreground/5 border border-card-border opacity-60">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-3">Compliance Benefits</p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-[10px] font-bold">
                                            <Shield className="h-3 w-3 text-green-500" /> Instant Bank Withdrawals
                                        </li>
                                        <li className="flex items-center gap-2 text-[10px] font-bold">
                                            <Shield className="h-3 w-3 text-green-500" /> Priority GHS/NGN Rates
                                        </li>
                                        <li className="flex items-center gap-2 text-[10px] font-bold">
                                            <Shield className="h-3 w-3 text-green-500" /> Personal Account Manager
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support Card */}
                    <div className="glass-morphism rounded-[32px] p-8 border border-card-border flex flex-col items-center text-center">
                        <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 border border-secondary/20">
                            <Mail className="h-8 w-8 text-secondary" />
                        </div>
                        <h4 className="font-bold mb-2">Need Compliance Help?</h4>
                        <p className="text-xs text-foreground/40 mb-6">Our support team in Ghana & Nigeria is active 24/7 for account queries.</p>
                        <button className="text-secondary text-sm font-bold hover:underline decoration-2 underline-offset-4">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
