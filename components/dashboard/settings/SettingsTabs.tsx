"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
    User as UserIcon,
    Lock,
    ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GeneralSettings } from "@/components/dashboard/settings/GeneralSettings";
import { SecuritySettings } from "@/components/dashboard/settings/SecuritySettings";
import { VerificationSettings } from "@/components/dashboard/settings/VerificationSettings";

interface SettingsTabsProps {
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        kyc_status: string;
        profile_image?: string | null;
        kyc_rejection_reason?: string | null;
    };
    role?: string;
}

export function SettingsTabs({ user, role }: SettingsTabsProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get("tab") || "general";
    const isAdmin = role === "ADMIN";

    const allTabs = [
        { id: "general", name: "General", icon: UserIcon },
        { id: "security", name: "Security", icon: Lock },
        { id: "verification", name: "Verification", icon: ShieldCheck },
    ];

    const tabs = isAdmin ? allTabs.filter(t => t.id !== "verification") : allTabs;

    const setTab = (id: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("tab", id);
        router.push(`/dashboard/settings?${params.toString()}`);
    };

    return (
        <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-1 md:p-1.5 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 w-full md:w-fit overflow-x-auto max-w-full no-scrollbar">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setTab(tab.id)}
                            className={`flex items-center gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all relative shrink-0 whitespace-nowrap ${isActive ? "text-primary" : "text-foreground/40 hover:text-foreground hover:bg-white/5"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{tab.name}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-tab-bg"
                                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="mt-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "general" && <GeneralSettings user={user} />}
                        {activeTab === "security" && <SecuritySettings />}
                        {activeTab === "verification" && <VerificationSettings user={user} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
