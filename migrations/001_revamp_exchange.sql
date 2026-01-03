
-- 1. Admin Wallets Table (For receiving user payments)
create table if not exists admin_wallets (
  id uuid default gen_random_uuid() primary key,
  chain text not null, -- e.g., 'BTC', 'ETH'
  currency text not null, -- e.g. 'BTC', 'USDT'
  address text not null,
  label text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Exchange Rates Table (For dynamic pricing)
create table if not exists exchange_rates (
  pair text primary key, -- e.g., 'BTC-USD'
  rate numeric not null default 0,
  manual_rate numeric, -- If set, overrides API rate
  margin_percent numeric default 0, -- Admin fee %
  is_automated boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
alter table admin_wallets enable row level security;
alter table exchange_rates enable row level security;

-- 4. Policies (Admin Full Access, Public Read)
-- Note: Assuming 'users' table has 'role' column based on inspection

-- Policy: Authenticated users can read active admin wallets (to pay)
create policy "Anyone can read active admin wallets"
    on admin_wallets for select
    using (is_active = true);

-- Policy: Admins can do everything on admin_wallets
create policy "Admins can manage admin_wallets"
    on admin_wallets for all
    using (
        auth.uid() in (select id from users where role = 'ADMIN')
    );

-- Policy: Anyone can read exchange rates (to see prices)
create policy "Anyone can read exchange rates"
    on exchange_rates for select
    using (true);

-- Policy: Admins can manage exchange rates
create policy "Admins can manage exchange rates"
    on exchange_rates for all
    using (
        auth.uid() in (select id from users where role = 'ADMIN')
    );
