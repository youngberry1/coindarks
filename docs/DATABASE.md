
# Supabase & Database Documentation

## Overview
This project uses **Supabase** (PostgreSQL) as its backend database. This document serves as a guide for setting up the database, understanding the schema, and migrating from previous versions.

## Setup Instructions

1. **Create a Supabase Project**:
   - Go to [database.new](https://database.new) and create a new project.
   - Note down your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

2. **Environment Variables**:
   Update your `.env` file with the keys from step 1:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Initialize Database**:
   - The database schema is defined in `supabase_schema.sql` located in the root of this project.
   - Copy the contents of `supabase_schema.sql`.
   - Go to the **SQL Editor** in your Supabase Dashboard.
   - Paste the SQL and run it to create all necessary tables, enums, and policies.

## Schema Reference

### Enums
- **UserRole**: `USER`, `ADMIN`, `SUPPORT`, `FINANCE`
- **UserStatus**: `ACTIVE`, `SUSPENDED`, `DELETED`
- **KYCStatus**: `UNVERIFIED`, `PENDING`, `APPROVED`, `REJECTED`
- **OrderStatus**: `PENDING`, `AWAITING_PAYMENT`, `PROCESSING`, `COMPLETED`, `CANCELLED`, `FAILED`

### Tables

#### 1. User
Stores user account information.
- `id`: UUID (Primary Key)
- `email`: Unique email address
- `role`: User permissions level (default: USER)
- `status`: Account status (default: ACTIVE)
- `emailVerified`: Timestamp of email verification

#### 2. VerificationToken
Handles ephemeral tokens for email verification.
- `token`: Unique token string
- `email`: Associated email
- `expires`: Expiration timestamp

#### 3. KYC (Know Your Customer)
Stores identity verification data. linked 1:1 with User.
- `userId`: Reference to User
- `status`: Verification status
- `idFrontUrl`, `selfieUrl`: Links to storage (Supabase Storage buckets)

#### 4. Order
Records transaction requests (Crypto <-> Fiat).
- `userId`: Reference to User
- `route`: "CRYPTO_TO_FIAT" or "FIAT_TO_CRYPTO"
- `amount`, `rate`: Decimal values for financial accuracy
- `status`: Current state of the order

#### 5. PaymentDetail
Stores user banking or wallet information.
- `type`: "BANK" or "CRYPTO"
- `details`: JSONB column storing flexible payment data (account number, bank name, etc.)

#### 6. AuditLog
Tracks important user actions for security and compliance.
- `action`: Description of the event
- `metadata`: JSONB column for extra context

## Security (RLS)
Row Level Security (RLS) is enabled on all tables.
*Current configuration*: **Public Access** (via `anon` key) is temporarily allowed to mimic previous behaviors during migration.
*Future TODO*: Tighten RLS policies to restrict access based on `auth.uid()` so users can only see their own data.

## Migration History
- **Dec 2025**: Migrated from Prisma/Neon (Postgres) to Supabase.
  - Removed Prisma ORM dependencies.
  - Replaced `lib/db.ts` with `lib/supabase.ts` for native Supabase client.
  - Converted Prisma Schema to SQL (`supabase_schema.sql`).
