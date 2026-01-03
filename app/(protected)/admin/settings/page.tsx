import { getAdminWallets } from "@/actions/admin-wallets";
import { getExchangeRates } from "@/actions/rates";
import { AdminWalletManager } from "@/components/admin/AdminWalletManager";
import { ExchangeRateManager } from "@/components/admin/ExchangeRateManager";
import { Settings } from "lucide-react";

export default async function AdminSettingsPage() {
    const wallets = await getAdminWallets();
    const rates = await getExchangeRates();

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
                    <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">System Settings</h1>
                    <p className="text-foreground/40 font-medium">Configure exchange parameters and deposit addresses.</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-1">
                {/* Wallets Section */}
                <section>
                    <AdminWalletManager initialWallets={wallets} />
                </section>

                {/* Rates Section */}
                <section>
                    <ExchangeRateManager initialRates={rates} />
                </section>
            </div>
        </div>
    );
}
