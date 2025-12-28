-- CoinDarks MASTER Supabase Schema
-- This is the single source of truth for the database.
-- Run this in the Supabase SQL Editor for both first-time setup or updates.

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Enums (Idempotent)
do $$ begin
    if not exists (select 1 from pg_type where typname = 'UserRole') then
        create type "UserRole" as enum ('USER', 'ADMIN', 'SUPPORT', 'FINANCE');
    end if;
    if not exists (select 1 from pg_type where typname = 'UserStatus') then
        create type "UserStatus" as enum ('ACTIVE', 'SUSPENDED', 'DELETED');
    end if;
    if not exists (select 1 from pg_type where typname = 'KYCStatus') then
        create type "KYCStatus" as enum ('UNVERIFIED', 'PENDING', 'APPROVED', 'REJECTED');
    end if;
    if not exists (select 1 from pg_type where typname = 'OrderStatus') then
        create type "OrderStatus" as enum ('PENDING', 'AWAITING_PAYMENT', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED');
    end if;
end $$;

-- 3. User Table
create table if not exists "User" (
  "id" uuid primary key default uuid_generate_v4(),
  "firstName" text not null,
  "middleName" text,
  "lastName" text not null,
  "email" text unique not null,
  "passwordHash" text,
  "role" "UserRole" default 'USER',
  "status" "UserStatus" default 'ACTIVE',
  "kycStatus" "KYCStatus" default 'UNVERIFIED',
  "emailVerified" timestamptz,
  "image" text,
  "deletedAt" timestamptz,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

-- 4. Verification & Reset Tables
create table if not exists "VerificationToken" (
  "id" uuid primary key default uuid_generate_v4(),
  "email" text not null,
  "token" text unique not null,
  "expires" timestamptz not null
);
create unique index if not exists "VerificationToken_email_token_key" on "VerificationToken"("email", "token");

create table if not exists "PasswordResetToken" (
  "id" uuid primary key default uuid_generate_v4(),
  "email" text not null,
  "token" text unique not null,
  "expires" timestamptz not null
);
create unique index if not exists "PasswordResetToken_email_token_key" on "PasswordResetToken"("email", "token");

-- 5. KYC, Orders & Payments
create table if not exists "KYC" (
  "id" uuid primary key default uuid_generate_v4(),
  "userId" uuid unique references "User"("id") on delete cascade,
  "fullName" text not null,
  "dob" timestamptz not null,
  "country" text not null,
  "idType" text not null,
  "idNumber" text not null,
  "idFrontUrl" text not null,
  "selfieUrl" text not null,
  "status" "KYCStatus" default 'UNVERIFIED',
  "rejectionReason" text,
  "reviewedBy" uuid references "User"("id"),
  "documentMetadata" jsonb default '{}'::jsonb,
  "submittedAt" timestamptz default now(),
  "reviewedAt" timestamptz,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

-- KYC Indexes for performance
create index if not exists "idx_kyc_status" on "KYC"("status");
create index if not exists "idx_kyc_user" on "KYC"("userId");

create table if not exists "Order" (
  "id" uuid primary key default uuid_generate_v4(),
  "userId" uuid references "User"("id"),
  "route" text not null,
  "fromCurrency" text not null,
  "toCurrency" text not null,
  "amount" decimal(20, 8) not null,
  "rate" decimal(20, 8) not null,
  "status" "OrderStatus" default 'PENDING',
  "paymentInfo" jsonb,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

create table if not exists "AssetPair" (
  "id" uuid primary key default uuid_generate_v4(),
  "crypto" text not null, -- BTC, USDT, ETH
  "fiat" text not null,   -- GHS, NGN
  "marginPercent" decimal(5, 2) default 1.50,
  "buyRate" decimal(20, 8), -- Optional override
  "sellRate" decimal(20, 8), -- Optional override
  "enabled" boolean default true,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

create table if not exists "PaymentDetail" (
  "id" uuid primary key default uuid_generate_v4(),
  "userId" uuid references "User"("id") on delete cascade,
  "type" text not null,
  "label" text not null,
  "details" jsonb not null,
  "isDefault" boolean default false,
  "createdAt" timestamptz default now()
);

create table if not exists "AuditLog" (
  "id" uuid primary key default uuid_generate_v4(),
  "userId" uuid references "User"("id"),
  "action" text not null,
  "metadata" jsonb,
  "createdAt" timestamptz default now()
);

-- 6. Functions & Triggers (Automatic UpdatedAt)
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new."updatedAt" = now();
    return new;
end;
$$ language plpgsql;

do $$ begin
    if not exists (select 1 from pg_trigger where tgname = 'set_user_updated_at') then
        create trigger set_user_updated_at before update on "User" for each row execute procedure update_updated_at_column();
    end if;
    if not exists (select 1 from pg_trigger where tgname = 'set_kyc_updated_at') then
        create trigger set_kyc_updated_at before update on "KYC" for each row execute procedure update_updated_at_column();
    end if;
    if not exists (select 1 from pg_trigger where tgname = 'set_order_updated_at') then
        create trigger set_order_updated_at before update on "Order" for each row execute procedure update_updated_at_column();
    end if;
        if not exists (select 1 from pg_trigger where tgname = 'set_assetpair_updated_at') then
        create trigger set_assetpair_updated_at before update on "AssetPair" for each row execute procedure update_updated_at_column();
    end if;
end $$;

-- 7. Row Level Security (RLS)
-- Enabling RLS and adding basic "Public Access" for service logic.
do $$ 
declare 
    t text;
begin
    for t in select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE'
    loop
        execute format('alter table %I enable row level security', t);
        if not exists (select 1 from pg_policies where tablename = t and policyname = 'Public Access') then
            execute format('create policy "Public Access" on %I for all using (true)', t);
        end if;
    end loop;
end $$;

-- ============================================
-- 8. SUPABASE STORAGE SETUP (KYC DOCUMENTS)
-- ============================================
-- IMPORTANT: This section documents the Supabase Storage configuration.
-- Storage buckets MUST be created manually in the Supabase Dashboard.
-- After creating the bucket, apply the RLS policies from migration_002_kyc_storage_policies.sql

-- STEP 1: Create Storage Bucket (Manual - Supabase Dashboard)
-- --------------------------------------------------------
-- 1. Go to Supabase Dashboard → Storage → New bucket
-- 2. Name: kyc-documents
-- 3. Public: NO (must be private!)
-- 4. File size limit: 5242880 (5MB)
-- 5. Click "Create bucket"

-- STEP 2: Apply Storage RLS Policies
-- --------------------------------------------------------
-- Run the SQL script: docs/migration_002_kyc_storage_policies.sql
-- This creates 5 policies:
--   1. Users can upload own KYC documents
--   2. Users can update own pending KYC documents
--   3. Users can delete own pending KYC documents
--   4. Admins can view all KYC documents
--   5. Users can view own KYC documents

-- STEP 3: Verify Storage Setup
-- --------------------------------------------------------
-- Run these verification queries:

-- Check bucket exists (should return 1 row with public = false)
-- SELECT * FROM storage.buckets WHERE name = 'kyc-documents';

-- Check policies exist (should return 5)
-- SELECT COUNT(*) FROM pg_policies 
-- WHERE tablename = 'objects' AND policyname LIKE '%KYC%';

-- ============================================
-- STORAGE STRUCTURE
-- ============================================
-- kyc-documents/                    ← Private bucket
-- ├── {user-uuid-1}/               ← User 1's folder
-- │   ├── id_front_timestamp.jpg
-- │   └── selfie_timestamp.jpg
-- ├── {user-uuid-2}/               ← User 2's folder
-- │   ├── id_front_timestamp.png
-- │   └── selfie_timestamp.png
-- └── ...

-- ============================================
-- SECURITY FEATURES
-- ============================================
-- ✓ Private bucket (no public URLs)
-- ✓ Folder isolation (users can only access their own folder)
-- ✓ Admin-only viewing (ADMIN/SUPPORT/FINANCE roles)
-- ✓ Signed URLs with 5-minute expiry
-- ✓ Status-based permissions (can't modify after approval)
-- ✓ Audit trail via documentMetadata column

