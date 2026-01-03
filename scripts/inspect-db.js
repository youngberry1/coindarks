
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
    'users',
    'orders',
    'inventory',
    'kyc_submissions',
    'transactions',
    'wallets',
    'admin_wallets',
    'exchange_rates'
];

async function inspect() {
    console.log('--- Database Inspection (Inferred from Data) ---');
    
    for (const table of tables) {
        process.stdout.write(`\nTable: ${table} ... `);
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (error) {
            console.log(`Error/Not Found (${error.message})`);
            continue;
        }

        if (data && data.length > 0) {
            console.log('Found! Columns (inferred from row 1):');
            const columns = Object.keys(data[0]);
            columns.forEach(col => {
                const val = data[0][col];
                let type = typeof val;
                if (val === null) type = 'unknown (null)';
                console.log(`  - ${col}: ${type}`);
            });
        } else {
            console.log('Found (Empty Table). Cannot infer columns.');
        }
    }
}

inspect();
