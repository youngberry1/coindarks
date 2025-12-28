# 🔄 KYC System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

1. USER SUBMISSION
   ┌──────────┐
   │  User    │ Fills KYC form
   │ Dashboard│ Uploads: ID Front + Selfie
   └────┬─────┘
        │
        ▼
   ┌──────────────────┐
   │ File Validation  │ Check: Size (≤5MB), Type (jpg/png)
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │ Supabase Storage │ Upload to: /kyc-documents/{userId}/
   │  (Private)       │ Files: id_front_*.jpg, selfie_*.jpg
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Database (KYC)  │ Create record with:
   │                  │ - Personal info
   │                  │ - File paths
   │                  │ - Status: PENDING
   │                  │ - Metadata: file sizes, types
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Email Service   │ Send: "KYC Submitted" email
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │  Audit Log       │ Log: KYC_SUBMITTED action
   └──────────────────┘


2. ADMIN REVIEW
   ┌──────────┐
   │  Admin   │ Views pending KYC list
   │ Dashboard│ Filters by: status, country, date
   └────┬─────┘
        │
        ▼
   ┌──────────────────┐
   │ Generate Signed  │ Create temporary URL (5min expiry)
   │      URLs        │ For: ID Front + Selfie
   └────┬─────────────┘
        │
        ▼
   ┌──────────────────┐
   │ Admin Reviews    │ Views documents securely
   │   Documents      │ Decides: APPROVE or REJECT
   └────┬─────────────┘
        │
        ├─── APPROVE ──────────┐
        │                      ▼
        │              ┌──────────────────┐
        │              │ Update KYC       │
        │              │ - status: APPROVED
        │              │ - reviewedBy: adminId
        │              │ - reviewedAt: now()
        │              └────┬─────────────┘
        │                   │
        │                   ▼
        │              ┌──────────────────┐
        │              │ Update User      │
        │              │ kycStatus: APPROVED
        │              └────┬─────────────┘
        │                   │
        │                   ▼
        │              ┌──────────────────┐
        │              │ Email: Approved  │
        │              └────┬─────────────┘
        │                   │
        │                   ▼
        │              ┌──────────────────┐
        │              │ Audit: KYC_APPROVED
        │              └──────────────────┘
        │
        └─── REJECT ───────────┐
                               ▼
                       ┌──────────────────┐
                       │ Update KYC       │
                       │ - status: REJECTED
                       │ - rejectionReason
                       │ - reviewedBy: adminId
                       └────┬─────────────┘
                            │
                            ▼
                       ┌──────────────────┐
                       │ Update User      │
                       │ kycStatus: REJECTED
                       └────┬─────────────┘
                            │
                            ▼
                       ┌──────────────────┐
                       │ Email: Rejected  │
                       │ (with reason)    │
                       └────┬─────────────┘
                            │
                            ▼
                       ┌──────────────────┐
                       │ Audit: KYC_REJECTED
                       └──────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────┘

Layer 1: AUTHENTICATION
   ├─ NextAuth v5 session validation
   └─ User must be logged in

Layer 2: AUTHORIZATION (RLS Policies)
   ├─ Users can only upload to /{their-uuid}/ folder
   ├─ Users can only view their own documents
   ├─ Admins can view ALL documents
   └─ Users can't modify APPROVED documents

Layer 3: FILE VALIDATION
   ├─ File size: ≤ 5MB
   ├─ File type: jpg, png, webp only
   ├─ Magic bytes check (prevent fake extensions)
   └─ EXIF data stripping (privacy)

Layer 4: STORAGE ISOLATION
   ├─ Private bucket (no public URLs)
   ├─ Signed URLs only (5-minute expiry)
   └─ Folder-based isolation per user

Layer 5: AUDIT TRAIL
   ├─ Every action logged in AuditLog table
   ├─ File metadata stored (sizes, types, timestamps)
   └─ Reviewer tracking (who approved/rejected)
```

---

## Database Relationships

```
┌──────────────┐
│     User     │
│ (Auth Table) │
└──────┬───────┘
       │
       │ 1:1
       │
       ▼
┌──────────────┐         ┌──────────────┐
│     KYC      │────────▶│  AuditLog    │
│              │  logs   │              │
│ - userId     │         │ - action     │
│ - status     │         │ - metadata   │
│ - reviewedBy │◀────┐   └──────────────┘
│ - documents  │     │
└──────────────┘     │
                     │
                     │ FK
                     │
              ┌──────┴───────┐
              │  reviewedBy  │
              │  (Admin User)│
              └──────────────┘
```

---

## File Storage Structure

```
Supabase Storage
│
└─ kyc-documents/ (PRIVATE BUCKET)
   │
   ├─ a1b2c3d4-e5f6-7890-abcd-ef1234567890/  ← User 1
   │  ├─ id_front_1735384800123.jpg
   │  └─ selfie_1735384800456.jpg
   │
   ├─ b2c3d4e5-f6g7-8901-bcde-fg2345678901/  ← User 2
   │  ├─ id_front_1735384900789.png
   │  └─ selfie_1735384900012.png
   │
   └─ ...

Access Methods:
├─ Direct URL: ❌ BLOCKED (private bucket)
├─ Signed URL: ✅ Temporary (5min expiry, admin only)
└─ Download: ✅ Through server action (with auth check)
```

---

## API Endpoints (To Be Built)

```
Server Actions:
├─ /actions/kyc/submit-kyc.ts
│  └─ Handles: File upload + DB insert + Email
│
├─ /actions/kyc/get-kyc-status.ts
│  └─ Handles: User checks their KYC status
│
├─ /actions/kyc/get-pending-kyc.ts (ADMIN)
│  └─ Handles: Admin fetches pending submissions
│
├─ /actions/kyc/generate-signed-url.ts (ADMIN)
│  └─ Handles: Create temporary document URLs
│
├─ /actions/kyc/approve-kyc.ts (ADMIN)
│  └─ Handles: Approve + Update + Email + Audit
│
└─ /actions/kyc/reject-kyc.ts (ADMIN)
   └─ Handles: Reject + Reason + Email + Audit
```

---

## Data Flow Example

```
User uploads KYC:
1. Browser → Server Action (submit-kyc.ts)
2. Server validates files
3. Server uploads to Supabase Storage
   - Path: /kyc-documents/{userId}/id_front_1735384800.jpg
4. Server creates KYC record in DB
   {
     userId: "a1b2...",
     fullName: "John Doe",
     idFrontUrl: "/a1b2.../id_front_1735384800.jpg",
     status: "PENDING",
     documentMetadata: {
       idFrontSize: 2048576,
       idFrontType: "image/jpeg",
       idFrontUploadedAt: "2025-12-28T11:00:00Z"
     }
   }
5. Server updates User.kycStatus = "PENDING"
6. Server logs audit: KYC_SUBMITTED
7. Server sends email: "KYC Submitted Successfully"
8. Return success to browser

Admin reviews:
1. Admin opens /admin/kyc
2. Server fetches pending KYC submissions
3. Admin clicks "View Documents"
4. Server generates signed URLs (5min expiry)
5. Admin views documents in modal
6. Admin clicks "Approve"
7. Server updates KYC.status = "APPROVED"
8. Server updates User.kycStatus = "APPROVED"
9. Server logs audit: KYC_APPROVED by adminId
10. Server sends email: "KYC Approved!"
11. User can now trade
```

---

**This architecture ensures:**
✅ Security (private storage, RLS, signed URLs)
✅ Compliance (audit logs, reviewer tracking)
✅ Privacy (EXIF stripping, folder isolation)
✅ Scalability (Supabase handles storage)
