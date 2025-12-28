// KYC-specific types for the application

export type KYCIdType =
    | 'NATIONAL_ID'
    | 'PASSPORT'
    | 'DRIVERS_LICENSE'
    | 'VOTERS_ID';

export interface KYCDocumentMetadata {
    idFrontSize?: number;
    idFrontType?: string;
    idFrontUploadedAt?: string;
    selfieSize?: number;
    selfieType?: string;
    selfieUploadedAt?: string;
}

export interface KYCSubmission {
    id: string;
    userId: string;
    fullName: string;
    dob: Date | string;
    country: string;
    idType: KYCIdType;
    idNumber: string;
    idFrontUrl: string;
    selfieUrl: string;
    status: 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string | null;
    reviewedBy?: string | null;
    documentMetadata?: KYCDocumentMetadata;
    submittedAt?: Date | string;
    reviewedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface KYCFormData {
    fullName: string;
    dob: string; // ISO date string
    country: string;
    idType: KYCIdType;
    idNumber: string;
    idFront: File;
    selfie: File;
}

export interface KYCReviewAction {
    kycId: string;
    action: 'APPROVE' | 'REJECT';
    rejectionReason?: string;
}

export interface SignedUrlResponse {
    url: string;
    expiresIn: number; // seconds
}

// Countries supported for KYC
export const SUPPORTED_COUNTRIES = [
    { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
] as const;

export type SupportedCountryCode = typeof SUPPORTED_COUNTRIES[number]['code'];

// ID Types with display names
export const ID_TYPES: Record<KYCIdType, string> = {
    NATIONAL_ID: 'National ID Card',
    PASSPORT: 'International Passport',
    DRIVERS_LICENSE: "Driver's License",
    VOTERS_ID: "Voter's ID Card",
};

// File upload constraints
export const KYC_FILE_CONSTRAINTS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;

// Signed URL expiry (in seconds)
export const SIGNED_URL_EXPIRY = 300; // 5 minutes
