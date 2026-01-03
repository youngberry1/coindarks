
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

// Initialize Supabase Client (Service Role for Admin Access)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAdminWallets() {
    console.log("Checking admin_wallets...");
    const { data, error } = await supabaseAdmin.from('admin_wallets').select('*');
    if (error) {
        console.error("Error:", error);
    } else {
        console.table(data);
    }
}

checkAdminWallets();
