
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const TARGET_USER_ID = 'f23c028b-adbb-4a3b-9309-50538c7e5578';

async function main() {
    console.log(`\n--- Debugging KYC for User: ${TARGET_USER_ID} ---\n`);

    // 1. Check User Record
    console.log('1. Checking User Record...');
    const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, kyc_status, first_name, last_name')
        .eq('id', TARGET_USER_ID)
        .single();

    if (userError) console.error('Error fetching user:', userError);
    else console.log('User found:', user);

    // 2. Check KYC Submissions Table
    console.log('\n2. Checking kyc_submissions Table...');
    const { data: kyc, error: kycError } = await supabaseAdmin
        .from('kyc_submissions')
        .select('*')
        .eq('user_id', TARGET_USER_ID);

    if (kycError) console.error('Error fetching kyc_submissions:', kycError);
    else console.log('KYC Records:', kyc);

    // 3. List Storage Bucket
    console.log('\n3. Listing "kyc-documents" Bucket...');

    // Try listing the root of user folder
    const { data: rootFiles, error: rootError } = await supabaseAdmin.storage
        .from('kyc-documents')
        .list(TARGET_USER_ID);

    if (rootError) {
        console.error('Error listing user folder:', rootError);
    } else {
        console.log(`Files in "${TARGET_USER_ID}/":`);
        if (rootFiles.length === 0) {
            console.log('(No files found in this folder)');
        } else {
            rootFiles.forEach(f => console.log(` - ${f.name} (${f.metadata?.mimetype}) size: ${f.metadata?.size}`));
        }
    }

    // Also list root to see if maybe they aren't in folders?
    const { data: allFiles, error: allError } = await supabaseAdmin.storage
        .from('kyc-documents')
        .list('', { limit: 10, search: TARGET_USER_ID });

    if (allError) {
        console.error('Error searching root:', allError);
    } else if (allFiles && allFiles.length > 0) {
        console.log('\nPotential matches in root matching the ID:');
        allFiles.forEach(f => console.log(` - ${f.name}`));
    }

}

main();
