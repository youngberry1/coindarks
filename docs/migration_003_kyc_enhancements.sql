-- ============================================
-- KYC Table Enhancements
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add reviewer tracking (which admin reviewed the KYC)
ALTER TABLE "KYC" 
ADD COLUMN IF NOT EXISTS "reviewedBy" uuid REFERENCES "User"("id");

-- 2. Add document metadata (file sizes, types for audit)
ALTER TABLE "KYC" 
ADD COLUMN IF NOT EXISTS "documentMetadata" jsonb DEFAULT '{}'::jsonb;

-- 3. Add index for faster queries on pending KYC
CREATE INDEX IF NOT EXISTS "idx_kyc_status" ON "KYC"("status");
CREATE INDEX IF NOT EXISTS "idx_kyc_user" ON "KYC"("userId");

-- 4. Add comment for documentation
COMMENT ON COLUMN "KYC"."reviewedBy" IS 'Admin user who approved/rejected this KYC submission';
COMMENT ON COLUMN "KYC"."documentMetadata" IS 'Stores file sizes, types, upload timestamps for audit trail';

-- ============================================
-- Verification Query
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'KYC'
ORDER BY ordinal_position;
