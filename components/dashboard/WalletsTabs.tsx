"use client";

import { memo, useMemo } from "react";
import { WalletManager } from "@/components/dashboard/WalletManager";
import { PaymentMethodManager } from "@/components/dashboard/PaymentMethodManager";
import { Wallet as WalletIcon, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WalletsTabsProps {
    activeTab: string;
    wallets: any[];
    paymentMethods: any[];
    assets: string[];
}

// Memoized tab content components for performance
const CryptoWalletsTab = memo(({ wallets, assets }: { wallets: any[], assets: string[] }) => (
    <div
        className="p-5 md:p-12 rounded-[32px] md:rounded-[40px] border border-white/5 bg-card-bg/50 backdrop-blur-xl relative overflow-hidden group"
        style={{
            willChange: 'transform',
            contain: 'layout style paint'
        }}
    >
        <div className="absolute top-0 right-0 p-6 md:p-12 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
            <WalletIcon className="h-32 w-32 md:h-64 md:w-64 opacity-50 md:opacity-100" />
        </div>

        <div className="relative">
            <div className="mb-8 md:mb-10">
                <h3 className="text-lg md:text-xl font-bold mb-3">Saved Crypto Wallets</h3>
                <p className="text-sm text-foreground/40 font-medium max-w-lg">
                    Add your destination wallets here (e.g. your TrustWallet or Binance deposit address). These will be available when you <strong>BUY</strong> assets.
                </p>
            </div>

            <WalletManager initialWallets={wallets} assets={assets} />
        </div>
    </div>
));
CryptoWalletsTab.displayName = "CryptoWalletsTab";

const FiatAccountsTab = memo(({ paymentMethods }: { paymentMethods: any[] }) => (
    <div
        className="p-5 md:p-12 rounded-[32px] md:rounded-[40px] border border-white/5 bg-card-bg/50 backdrop-blur-xl relative overflow-hidden group"
        style={{
            willChange: 'transform',
            contain: 'layout style paint'
        }}
    >
        <div className="absolute top-0 right-0 p-6 md:p-12 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
            <CreditCard className="h-32 w-32 md:h-64 md:w-64 opacity-50 md:opacity-100" />
        </div>

        <div className="relative">
            <div className="mb-8 md:mb-10">
                <h3 className="text-lg md:text-xl font-bold mb-3">Saved Bank & Mobile Accounts</h3>
                <p className="text-sm text-foreground/40 font-medium max-w-lg">
                    Add your Bank or Mobile Money accounts here. These will be available when you <strong>SELL</strong> assets to receive payment.
                </p>
            </div>

            <PaymentMethodManager initialMethods={paymentMethods} />
        </div>
    </div>
));
FiatAccountsTab.displayName = "FiatAccountsTab";

export const WalletsTabs = memo(({ activeTab, wallets, paymentMethods, assets }: WalletsTabsProps) => {
    // Memoize tab content to prevent re-renders
    const cryptoTab = useMemo(() => (
        <CryptoWalletsTab wallets={wallets} assets={assets} />
    ), [wallets, assets]);

    const fiatTab = useMemo(() => (
        <FiatAccountsTab paymentMethods={paymentMethods} />
    ), [paymentMethods]);

    return (
        <div className="max-w-6xl">
            <Tabs defaultValue={activeTab} className="space-y-6 md:space-y-8">
                <TabsList className="bg-card-bg/50 border border-white/5 p-1 rounded-2xl inline-flex w-full md:w-auto h-auto">
                    <TabsTrigger
                        value="crypto"
                        className="flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all"
                        style={{ willChange: 'transform' }}
                    >
                        Crypto Wallets
                    </TabsTrigger>
                    <TabsTrigger
                        value="fiat"
                        className="flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all"
                        style={{ willChange: 'transform' }}
                    >
                        Bank & Mobile
                    </TabsTrigger>
                </TabsList>

                <TabsContent
                    value="crypto"
                    className="outline-none"
                    forceMount
                    style={{
                        display: activeTab === 'crypto' ? 'block' : 'none',
                        willChange: 'opacity',
                    }}
                >
                    {cryptoTab}
                </TabsContent>

                <TabsContent
                    value="fiat"
                    className="outline-none"
                    forceMount
                    style={{
                        display: activeTab === 'fiat' ? 'block' : 'none',
                        willChange: 'opacity',
                    }}
                >
                    {fiatTab}
                </TabsContent>
            </Tabs>
        </div>
    );
});
WalletsTabs.displayName = "WalletsTabs";
