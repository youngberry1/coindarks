-- Safely fix RLS policies for orders table
-- Drops existing policies to avoid conflicts, then re-creates them.

-- 1. Ensure Table Exists (Idempotent)
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  order_number text,
  user_id uuid references auth.users not null,
  type text not null,
  asset text not null,
  amount_crypto numeric,
  amount_fiat numeric,
  fiat_currency text,
  receiving_address text,
  status text default 'PENDING',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table orders enable row level security;

-- 3. Drop existing policies (to fix specific error "policy already exists")
drop policy if exists "Users can view own orders" on orders;
drop policy if exists "Users can insert own orders" on orders;
drop policy if exists "Admins can view all orders" on orders;
-- Also drop potential old/other named policies if you suspect them example:
drop policy if exists "Enable read access for own orders" on orders;
drop policy if exists "Enable insert for own orders" on orders;

-- 4. Re-create Policies

-- Policy: Users can view their own orders
create policy "Users can view own orders"
    on orders for select
    using (auth.uid() = user_id);

-- Policy: Users can insert own orders
create policy "Users can insert own orders"
    on orders for insert
    with check (auth.uid() = user_id);

-- Policy: Admins can view all orders
create policy "Admins can view all orders"
    on orders for select
    using (
        auth.uid() in (select id from users where role = 'ADMIN')
    );
