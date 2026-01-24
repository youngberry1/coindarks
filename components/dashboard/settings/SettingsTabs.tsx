"use client";

import { useSearchParams } from "next/navigation";
import { memo, useMemo, useState } from "react";
import {
    User as UserIcon,
    Lock,
    ShieldCheck,
} from "lucide-react";
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

// Memoized tab content components
const MemoizedGeneralSettings = memo(GeneralSettings);
const MemoizedSecuritySettings = memo(SecuritySettings);
const MemoizedVerificationSettings = memo(VerificationSettings);

export function SettingsTabs({ user, role }: SettingsTabsProps) {
    const searchParams = useSearchParams();

    // Initialize state from URL param, default to "general"
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "general");
    const isAdmin = role === "ADMIN";

    const allTabs = [
        { id: "general", name: "General", icon: UserIcon },
        { id: "security", name: "Security", icon: Lock },
        { id: "verification", name: "Verification", icon: ShieldCheck },
    ];

    const tabs = isAdmin ? allTabs.filter(t => t.id !== "verification") : allTabs;

    const setTab = (id: string) => {
        setActiveTab(id);

        // Update URL silently
        const params = new URLSearchParams(window.location.search);
        params.set("tab", id);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
    };

    // Memoize tab content to prevent unnecessary re-renders
    const generalContent = useMemo(() => <MemoizedGeneralSettings user={user} />, [user]);
    const securityContent = useMemo(() => <MemoizedSecuritySettings />, []);
    const verificationContent = useMemo(() => <MemoizedVerificationSettings user={user} />, [user]);

    return (
        <div className="space-y-8">
            {/* Tab Navigation */}
            <div
                className={`w-full grid gap-1 p-1 rounded-xl bg-white/5 border border-white/10 md:flex md:w-fit md:p-1.5 md:rounded-2xl ${tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}
                style={{ willChange: 'transform' }}
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setTab(tab.id)}
                            className={`flex items-center justify-center gap-2 px-1 py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all relative whitespace-nowrap md:px-6 md:py-2.5 md:text-sm md:justify-start ${isActive ? "text-primary" : "text-foreground/40 hover:text-foreground hover:bg-white/5"
                                }`}
                            style={{ willChange: 'transform' }}
                        >
                            <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span>{tab.name}</span>
                            {isActive && (
                                <div
                                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg md:rounded-xl -z-10"
                                    style={{
                                        willChange: 'transform',
                                        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content Area - All tabs force-mounted for instant switching */}
            <div className="mt-8">
                <div
                    style={{
                        display: activeTab === "general" ? "block" : "none",
                        willChange: 'opacity',
                        contain: 'layout style paint',
                    }}
                >
                    {generalContent}
                </div>
                <div
                    style={{
                        display: activeTab === "security" ? "block" : "none",
                        willChange: 'opacity',
                        contain: 'layout style paint',
                    }}
                >
                    {securityContent}
                </div>
                {!isAdmin && (
                    <div
                        style={{
                            display: activeTab === "verification" ? "block" : "none",
                            willChange: 'opacity',
                            contain: 'layout style paint',
                        }}
                    >
                        {verificationContent}
                    </div>
                )}
            </div>
        </div>
    );
}
