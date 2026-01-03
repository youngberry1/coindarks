
import 'dotenv/config';
import { supabaseAdmin } from '../lib/supabase-admin';

async function main() {
    console.log('--- Inspecting Orders Table ---');

    // 1. Check Columns
    console.log('\nFetching columns for "orders"...');
    const { data: orders, error: colError } = await supabaseAdmin
        .from('orders')
        .select('*')
        .limit(1);

    if (colError) {
        console.error('Error fetching one order:', colError);
    } else {
        console.log('Sample Order:', JSON.stringify(orders, null, 2));
    }

    // 2. Check if we can query policies directly? 
    // Probably not without a custom RPC. 
    // But we can check if orders exist at all.

    console.log('\nCounting Total Orders...');
    const { count, error: countError } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true });

    if (countError) console.error('Count Error:', countError);
    else console.log('Total Orders in DB:', count);

}

main();
