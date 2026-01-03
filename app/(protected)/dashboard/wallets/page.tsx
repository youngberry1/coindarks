
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { WalletManager } from "@/components/dashboard/WalletManager";
import { PaymentMethodManager } from "@/components/dashboard/PaymentMethodManager";
import { getWallets } from "@/actions/wallets";
import { getPaymentMethods } from "@/actions/payment-methods";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Wallet as WalletIcon, ShieldCheck, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
    title: "My Wallets | CoinDarks",
    description: "Manage your saved crypto and fiat accounts.",
};

export default async function WalletsPage(props: { searchParams: Promise<{ tab?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await auth();
    if (!session) redirect("/login");

    const activeTab = searchParams.tab || "crypto";

    const wallets = await getWallets();
    const paymentMethods = await getPaymentMethods();

    // Fetch supported assets
    const { data: inventory } = await supabaseAdmin
        .from('inventory')
        .select('asset');

    const assets = inventory?.map(i => i.asset) || ["BTC", "XLM", "USDT", "USDC", "SOL", "LTC"];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">My Wallets</h1>
                    <p className="text-foreground/50 font-medium">Manage your external wallets and payment beneficiaries.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest leading-none mb-1">Security</p>
                            <p className="text-sm font-bold">Whitelisted Only</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl">
                <Tabs defaultValue={activeTab} className="space-y-8">
                    <TabsList className="bg-card-bg/50 border border-white/5 p-1 rounded-2xl inline-flex h-auto">
                        <TabsTrigger
                            value="crypto"
                            className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase tracking-widest transition-all"
                        >
                            Crypto Wallets
                        </TabsTrigger>
                        <TabsTrigger
                            value="fiat"
                            className="px-6 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs uppercase tracking-widest transition-all"
                        >
                            Fiat Accounts
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="crypto" className="outline-none">
                        <div className="p-8 md:p-12 rounded-[40px] border border-white/5 bg-card-bg/50 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <WalletIcon className="h-64 w-64" />
                            </div>

                            <div className="relative">
                                <div className="mb-10">
                                    <h3 className="text-xl font-bold mb-3">Saved Crypto Addresses</h3>
                                    <p className="text-sm text-foreground/40 font-medium max-w-lg">
                                        Add your destination wallet addresses here (e.g. your TrustWallet or Binance deposit address). These will be available when you <strong>BUY</strong> crypto.
                                    </p>
                                </div>

                                <WalletManager initialWallets={wallets} assets={assets} />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="fiat" className="outline-none">
                        <div className="p-8 md:p-12 rounded-[40px] border border-white/5 bg-card-bg/50 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 text-primary/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                                <CreditCard className="h-64 w-64" />
                            </div>

                            <div className="relative">
                                <div className="mb-10">
                                    <h3 className="text-xl font-bold mb-3">Saved Fiat Accounts</h3>
                                    <p className="text-sm text-foreground/40 font-medium max-w-lg">
                                        Add your Bank or Mobile Money accounts here. These will be available when you <strong>SELL</strong> crypto to receive payment.
                                    </p>
                                </div>

                                <PaymentMethodManager initialMethods={paymentMethods} />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
