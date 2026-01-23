"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
    User as UserIcon,
    Lock,
    Settings,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GeneralSettings } from "@/components/dashboard/settings/GeneralSettings";
import { SecuritySettings } from "@/components/dashboard/settings/SecuritySettings";
import { SystemSettings } from "@/components/admin/settings/SystemSettings";
import { cn } from "@/lib/utils";

import { AdminWallet } from "@/actions/admin-wallets";
import { ExchangeRate } from "@/actions/rates";

interface AdminSettingsTabsProps {
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        profile_image?: string | null;
    };
    wallets: AdminWallet[];
    rates: ExchangeRate[];
}

export function AdminSettingsTabs({ user, wallets, rates }: AdminSettingsTabsProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get("tab") || "system";

    const tabs = [
        { id: "system", name: "General Rules", icon: Settings },
        { id: "general", name: "Profile Details", icon: UserIcon },
        { id: "security", name: "Security Settings", icon: Lock },
    ];

    const setTab = (id: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("tab", id);
        router.push(`/admin/settings?${params.toString()}`);
    };

    return (
        <div className="space-y-6 sm:space-y-12 max-w-full overflow-hidden">
            {/* Tab Navigation Matrix */}
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-8 max-w-full">
                <div className="flex items-center gap-1 p-1 sm:p-2 rounded-[20px] sm:rounded-[32px] glass border border-white/5 w-full md:w-fit overflow-x-auto no-scrollbar shadow-2xl max-w-full">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 sm:gap-2.5 sm:px-8 h-10 sm:h-14 rounded-[16px] sm:rounded-[24px] text-[8px] sm:text-xs font-black uppercase tracking-widest sm:tracking-[0.2em] transition-all relative shrink-0 whitespace-nowrap z-10",
                                    isActive ? "text-white" : "text-foreground/30 hover:text-foreground/60 hover:bg-white/5"
                                )}
                            >
                                <Icon className={cn("h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-500", isActive && "scale-110 rotate-12")} />
                                <span>{tab.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="admin-active-tab-bg"
                                        className="absolute inset-0 bg-primary rounded-[16px] sm:rounded-[24px] -z-10 shadow-xl shadow-primary/20"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="h-14 px-8 rounded-[32px] glass border border-white/5 items-center gap-4 text-foreground/20 hidden lg:flex">
                    <Activity className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{activeTab.toUpperCase()} ACTIVE</span>
                </div>
            </div>

            {/* Content Area Matrix */}
            <div className="mt-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="w-full"
                    >
                        {activeTab === "system" && <SystemSettings wallets={wallets} rates={rates} />}
                        {activeTab === "general" && <GeneralSettings user={user} />}
                        {activeTab === "security" && <SecuritySettings />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
