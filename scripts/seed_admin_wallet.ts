
import 'dotenv/config';
import { supabaseAdmin } from "@/lib/supabase-admin";

async function main() {
    console.log("Seeding Admin Wallets...");

    const wallets = [
        {
            chain: 'BITCOIN',
            currency: 'BTC',
            address: 'bc1qXYZAAdminWalletAddressForTestingOnly',
            label: 'Primary BTC Wallet',
            is_active: true
        },
        {
            chain: 'ETHEREUM',
            currency: 'ETH',
            address: '0xAdminWalletAddressForTestingOnly',
            label: 'Primary ETH Wallet',
            is_active: true
        },
        {
            chain: 'TRON',
            currency: 'USDT',
            address: 'TAdminWalletAddressForTestingOnly',
            label: 'Primary USDT Wallet',
            is_active: true
        }
    ];

    for (const w of wallets) {
        const { error } = await supabaseAdmin
            .from('admin_wallets')
            .upsert(w, { onConflict: 'address' }); // Assuming address is unique or we just want to ensure it exists

        if (error) {
            console.error(`Failed to insert ${w.currency}:`, error);
        } else {
            console.log(`Seeded ${w.currency} wallet.`);
        }
    }

    console.log("Done.");
}

main();
