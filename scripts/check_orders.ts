
import 'dotenv/config';
import { supabaseAdmin } from '../lib/supabase-admin';

async function main() {
    console.log('Fetching last 5 orders...');
    const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching orders:', error);
    } else {
        console.log('Last 5 orders found:', JSON.stringify(orders, null, 2));
    }
}

main();
