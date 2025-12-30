"use client";

import { WalletManager } from "../WalletManager";

interface WalletSettingsProps {
    initialWallets: {
        asset: string;
        address: string;
    }[];
    assets: string[];
}

export function WalletSettings({ initialWallets, assets }: WalletSettingsProps) {
    return (
        <div className="max-w-3xl space-y-8">
            <div className="p-8 rounded-[32px] border border-white/5 bg-card-bg/50 backdrop-blur-md">
                <div className="mb-8">
                    <h3 className="text-lg font-bold mb-2">Saved Wallets</h3>
                    <p className="text-sm text-foreground/40 font-medium italic">Save your external wallet addresses for faster checkouts during buy orders.</p>
                </div>

                <WalletManager initialWallets={initialWallets} assets={assets} />
            </div>
        </div>
    );
}
