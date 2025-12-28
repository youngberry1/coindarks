# 🗂️ KYC Storage Setup Guide

## Overview
This guide walks you through setting up Supabase Storage for secure KYC document management.

---

## ✅ Prerequisites
- Supabase project created
- Admin access to Supabase Dashboard
- Database schema already deployed

---

## 📋 Step-by-Step Setup

### **Step 1: Create Storage Bucket (Manual - Supabase Dashboard)**

1. **Navigate to Storage**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your `coindarks` project
   - Click **Storage** in the left sidebar

2. **Create New Bucket**
   - Click **"New bucket"** button
   - Enter the following details:
     ```
     Name: kyc-documents
     Public bucket: ❌ UNCHECKED (MUST BE PRIVATE!)
     File size limit: 5242880 (5MB)
     Allowed MIME types: (leave empty - we validate in code)
     ```
   - Click **"Create bucket"**

3. **Verify**
   - You should see `kyc-documents` in your buckets list
   - It should have a 🔒 lock icon (private)

---

### **Step 2: Apply Storage RLS Policies (SQL Editor)**

1. **Open SQL Editor**
   - In Supabase Dashboard, click **SQL Editor**
   - Click **"New query"**

2. **Run Storage Policies Script**
   - Copy the contents of `docs/migration_002_kyc_storage_policies.sql`
   - Paste into SQL Editor
   - Click **"Run"**
   - You should see: "Success. No rows returned"

3. **Verify Policies**
   - Run the verification query at the bottom of the script
   - You should see 5 policies created:
     - ✅ Users can upload own KYC documents
     - ✅ Users can update own pending KYC documents
     - ✅ Users can delete own pending KYC documents
     - ✅ Admins can view all KYC documents
     - ✅ Users can view own KYC documents

---

### **Step 3: Apply Database Enhancements (SQL Editor)**

1. **Run KYC Enhancements Script**
   - Copy the contents of `docs/migration_003_kyc_enhancements.sql`
   - Paste into SQL Editor
   - Click **"Run"**

2. **Verify Changes**
   - Run the verification query at the bottom
   - Confirm these new columns exist in the `KYC` table:
     - ✅ `reviewedBy` (uuid)
     - ✅ `documentMetadata` (jsonb)
   - Confirm these indexes exist:
     - ✅ `idx_kyc_status`
     - ✅ `idx_kyc_user`

---

### **Step 4: No API Keys Needed! 🎉**

**Good news:** You don't need any additional API keys for Supabase Storage!

Your existing environment variables are sufficient:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The Supabase client (`lib/supabase.ts`) already has access to Storage through these credentials.

---

## 🔐 Security Features Implemented

| Feature | Description |
|---------|-------------|
| **Private Bucket** | Documents are NOT publicly accessible |
| **Folder Isolation** | Users can only upload to `/{their-user-id}/` folder |
| **Admin-Only Access** | Only ADMIN/SUPPORT/FINANCE roles can view documents |
| **Signed URLs** | Temporary, expiring URLs for secure document viewing |
| **Status-Based Permissions** | Users can't modify documents after KYC approval |
| **Audit Trail** | `documentMetadata` tracks file sizes, types, timestamps |

---

## 📁 Storage Structure

```
kyc-documents/
├── {user-id-1}/
│   ├── id_front_1735384800000.jpg
│   └── selfie_1735384800000.jpg
├── {user-id-2}/
│   ├── id_front_1735384900000.png
│   └── selfie_1735384900000.png
└── ...
```

---

## 🧪 Testing the Setup

### **Test 1: Verify Bucket Exists**
```sql
-- Run in SQL Editor
SELECT * FROM storage.buckets WHERE name = 'kyc-documents';
```
Expected: 1 row with `public = false`

### **Test 2: Verify Policies**
```sql
-- Run in SQL Editor
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%KYC%';
```
Expected: 5 policies listed

### **Test 3: Verify KYC Table Columns**
```sql
-- Run in SQL Editor
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'KYC' 
AND column_name IN ('reviewedBy', 'documentMetadata');
```
Expected: 2 rows

---

## ✅ Checklist

Before proceeding to code implementation, confirm:

- [ ] `kyc-documents` bucket created (private)
- [ ] 5 RLS policies applied to `storage.objects`
- [ ] `KYC` table has `reviewedBy` column
- [ ] `KYC` table has `documentMetadata` column
- [ ] Indexes `idx_kyc_status` and `idx_kyc_user` exist
- [ ] No errors in SQL Editor

---

## 🚀 Next Steps

Once setup is complete, we'll build:
1. **KYC Submission Form** (user uploads documents)
2. **File Upload Service** (handles Supabase Storage uploads)
3. **Admin Review Panel** (generates signed URLs for viewing)
4. **Email Notifications** (submission, approval, rejection)

---

## 🆘 Troubleshooting

### Issue: "Bucket already exists"
**Solution:** The bucket was already created. Skip Step 1.

### Issue: "Policy already exists"
**Solution:** Policies were already applied. This is safe - they're idempotent.

### Issue: "Column already exists"
**Solution:** Enhancements were already applied. This is safe.

### Issue: "Permission denied for storage.objects"
**Solution:** 
1. Go to Storage → kyc-documents → Policies
2. Ensure RLS is enabled
3. Re-run `migration_002_kyc_storage_policies.sql`

---

**Setup Complete!** ✅ You're ready to start building the KYC submission flow.
