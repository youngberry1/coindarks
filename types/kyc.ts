export const KYC_FILE_CONSTRAINTS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'] as const,
};

export const SIGNED_URL_EXPIRY = 60 * 60; // 1 hour in seconds

export const SUPPORTED_COUNTRIES = [
    { name: 'Ghana', code: 'GH' },
    { name: 'Nigeria', code: 'NG' }
] as const;

export type KYCIdType = 'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'VOTERS_ID';
