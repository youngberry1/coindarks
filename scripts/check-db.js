
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('--- Checking Tables ---');
  const tables = ['admin_wallets', 'exchange_rates', 'inventory', 'wallets', 'orders'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table '${table}': ERROR/MISSING - ${error.message}`);
    } else {
      console.log(`Table '${table}': EXISTS`);
    }
  }

  // Attempt to read system info (often not allowed via API, but worth a try with Service Key)
  // If this fails, we rely on the table checks above.
  /*
  console.log('\n--- Checking Policies (via pg_policies view) ---');
  const { data: policies, error: policyError } = await supabase.rpc('get_policies'); 
  // Note: standard client can't run arbitrary SQL or select from pg_ tables usually, 
  // unless a specific RPC is set up. We likely can't see policies directly this way 
  // without an RPC. failing that, we assume existence based on the user's error.
  */
}

inspect();
