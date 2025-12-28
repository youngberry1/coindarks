-- ============================================
-- KYC Storage Bucket RLS Policies
-- Run this in Supabase SQL Editor after creating the 'kyc-documents' bucket
-- ============================================

-- 1. Policy: Users can INSERT (upload) files only to their own folder
CREATE POLICY "Users can upload own KYC documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Policy: Users can UPDATE (replace) their own files ONLY if KYC status is not APPROVED
-- This prevents users from changing documents after approval
CREATE POLICY "Users can update own pending KYC documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()
    AND "kycStatus" IN ('UNVERIFIED', 'REJECTED')
  )
);

-- 3. Policy: Users can DELETE their own files ONLY if KYC is not approved
CREATE POLICY "Users can delete own pending KYC documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()
    AND "kycStatus" IN ('UNVERIFIED', 'REJECTED')
  )
);

-- 4. Policy: Admins can SELECT (view/download) ALL KYC documents
CREATE POLICY "Admins can view all KYC documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()
    AND role IN ('ADMIN', 'SUPPORT', 'FINANCE')
  )
);

-- 5. Policy: Users can SELECT (view) ONLY their own documents
CREATE POLICY "Users can view own KYC documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- Verification Query
-- Run this to check if policies were created successfully
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%KYC%'
ORDER BY policyname;
