-- 1. Ensure Orders Table Exists
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  order_number text, -- e.g. "CD-123456"
  user_id uuid references auth.users not null,
  type text not null, -- 'BUY' or 'SELL'
  asset text not null, -- 'BTC', 'ETH'
  amount_crypto numeric,
  amount_fiat numeric,
  fiat_currency text,
  receiving_address text,
  status text default 'PENDING',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table orders enable row level security;

-- 3. Policies

-- Policy: Users can view their own orders
create policy "Users can view own orders"
    on orders for select
    using (auth.uid() = user_id);

-- Policy: Users can create orders (Server action uses service role, but good to have)
create policy "Users can insert own orders"
    on orders for insert
    with check (auth.uid() = user_id);

-- Policy: Service Role (Admin) has full access
-- (Implicitly true for service_role, but explicit policies for admin users if needed)
create policy "Admins can view all orders"
    on orders for select
    using (
        auth.uid() in (select id from users where role = 'ADMIN')
    );
