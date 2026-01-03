-- Create a table for user payment methods
create table if not exists "user_payment_methods" (
    "id" uuid primary key default gen_random_uuid(),
    "user_id" uuid references "users" ("id") on delete cascade not null,
    "method_type" text not null check (method_type in ('BANK_ACCOUNT', 'MOBILE_MONEY')),
    "provider" text not null, -- Bank Name (e.g. GTBank) or Network (e.g. MTN)
    "account_number" text not null,
    "account_name" text not null,
    "is_default" boolean default false,
    "created_at" timestamp with time zone default now()
);

-- Enable RLS
alter table "user_payment_methods" enable row level security;

-- Policies
create policy "Users can view their own payment methods"
    on "user_payment_methods"
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own payment methods"
    on "user_payment_methods"
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own payment methods"
    on "user_payment_methods"
    for update
    using (auth.uid() = user_id);

create policy "Users can delete their own payment methods"
    on "user_payment_methods"
    for delete
    using (auth.uid() = user_id);

-- Admins can view all (using service role bypass mostly, but good to have)
create policy "Admins can view all payment methods"
    on "user_payment_methods"
    for select
    using (
        exists (
            select 1 from users
            where users.id = auth.uid()
            and users.role = 'ADMIN'
        )
    );
