# 🚀 QUICK START: KYC Storage Setup

## ⏱️ Total Time: ~5 minutes

---

## Step 1: Create Bucket (Supabase Dashboard)
```
1. Go to: https://supabase.com/dashboard
2. Select: coindarks project
3. Click: Storage → New bucket
4. Settings:
   - Name: kyc-documents
   - Public: ❌ NO (must be private!)
   - Size limit: 5242880
5. Click: Create bucket
```

---

## Step 2: Run SQL Scripts (SQL Editor)

### Script 1: Storage Policies
```bash
# File: docs/migration_002_kyc_storage_policies.sql
# What it does: Secures file uploads and access
# Run in: Supabase SQL Editor
```

### Script 2: Database Enhancements
```bash
# File: docs/migration_003_kyc_enhancements.sql
# What it does: Adds reviewer tracking and metadata
# Run in: Supabase SQL Editor
```

---

## ✅ Verify Setup

Run this in SQL Editor:
```sql
-- Should return 1 row
SELECT * FROM storage.buckets WHERE name = 'kyc-documents';

-- Should return 5 rows
SELECT policyname FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%KYC%';

-- Should return 2 rows
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'KYC' 
AND column_name IN ('reviewedBy', 'documentMetadata');
```

---

## 🎉 Done!

No API keys needed - your existing Supabase credentials work!

**Next:** Build the KYC submission form 🚀

---

**Full Guide:** See `docs/KYC_STORAGE_SETUP.md`
