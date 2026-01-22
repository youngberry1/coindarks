"use client";

import { AdminWalletManager } from "@/components/admin/AdminWalletManager";
import { ExchangeRateManager } from "@/components/admin/ExchangeRateManager";

import { AdminWallet } from "@/actions/admin-wallets";
import { ExchangeRate } from "@/actions/rates";

interface SystemSettingsProps {
    wallets: AdminWallet[];
    rates: ExchangeRate[];
}

export function SystemSettings({ wallets, rates }: SystemSettingsProps) {
    return (
        <div className="grid gap-8 lg:grid-cols-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Wallets Section */}
            <section>
                <AdminWalletManager initialWallets={wallets} />
            </section>

            {/* Rates Section */}
            <section>
                <ExchangeRateManager initialRates={rates} />
            </section>
        </div>
    );
}
