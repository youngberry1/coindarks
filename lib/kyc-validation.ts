import { z } from 'zod';
import { KYCIdType, SUPPORTED_COUNTRIES } from '@/types/kyc';

/**
 * KYC Validation Utilities
 * Zod schemas and validation functions for KYC data
 */

// Supported countries
const supportedCountryCodes = SUPPORTED_COUNTRIES.map(c => c.code);

/**
 * KYC Form Data Schema
 */
export const KYCFormSchema = z.object({
    fullName: z
        .string()
        .min(3, 'Full name must be at least 3 characters')
        .max(100, 'Full name must not exceed 100 characters')
        .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'),

    dob: z
        .string()
        .refine((date) => {
            const birthDate = new Date(date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                return age - 1 >= 18;
            }
            return age >= 18;
        }, 'You must be at least 18 years old'),

    country: z
        .string()
        .refine((code) => supportedCountryCodes.includes(code as any), 'Invalid country selected'),

    idType: z.enum(['NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'VOTERS_ID'] as const),

    idNumber: z
        .string()
        .min(5, 'ID number must be at least 5 characters')
        .max(30, 'ID number must not exceed 30 characters')
        .regex(/^[A-Z0-9-]+$/i, 'ID number can only contain letters, numbers, and hyphens'),
});

export type KYCFormData = z.infer<typeof KYCFormSchema>;

/**
 * Validate ID number format based on country and ID type
 */
export function validateIdNumber(idNumber: string, country: string, idType: KYCIdType): {
    valid: boolean;
    error?: string;
} {
    const cleanId = idNumber.toUpperCase().replace(/\s/g, '');

    // Ghana ID validation
    if (country === 'GH') {
        switch (idType) {
            case 'NATIONAL_ID':
                // Ghana Card format: GHA-XXXXXXXXX-X (13 chars with hyphens)
                if (!/^GHA-\d{9}-\d$/.test(cleanId)) {
                    return {
                        valid: false,
                        error: 'Ghana National ID must be in format: GHA-XXXXXXXXX-X',
                    };
                }
                break;
            case 'PASSPORT':
                // Ghana passport: G followed by 7 digits
                if (!/^G\d{7}$/.test(cleanId)) {
                    return {
                        valid: false,
                        error: 'Ghana Passport must be in format: G followed by 7 digits',
                    };
                }
                break;
            case 'DRIVERS_LICENSE':
                // Ghana driver's license: Variable format, just check length
                if (cleanId.length < 8 || cleanId.length > 15) {
                    return {
                        valid: false,
                        error: 'Ghana Driver\'s License must be between 8-15 characters',
                    };
                }
                break;
            case 'VOTERS_ID':
                // Ghana voter ID: 10 digits
                if (!/^\d{10}$/.test(cleanId)) {
                    return {
                        valid: false,
                        error: 'Ghana Voter\'s ID must be 10 digits',
                    };
                }
                break;
        }
    }

    // Nigeria ID validation
    if (country === 'NG') {
        switch (idType) {
            case 'NATIONAL_ID':
                // Nigeria NIN: 11 digits
                if (!/^\d{11}$/.test(cleanId)) {
                    return {
                        valid: false,
                        error: 'Nigeria National ID (NIN) must be 11 digits',
                    };
                }
                break;
            case 'PASSPORT':
                // Nigeria passport: A followed by 8 digits
                if (!/^A\d{8}$/.test(cleanId)) {
                    return {
                        valid: false,
                        error: 'Nigeria Passport must be in format: A followed by 8 digits',
                    };
                }
                break;
            case 'DRIVERS_LICENSE':
                // Nigeria driver's license: Variable format
                if (cleanId.length < 10 || cleanId.length > 15) {
                    return {
                        valid: false,
                        error: 'Nigeria Driver\'s License must be between 10-15 characters',
                    };
                }
                break;
            case 'VOTERS_ID':
                // Nigeria PVC: 19 characters alphanumeric
                if (!/^[A-Z0-9]{19}$/.test(cleanId)) {
                    return {
                        valid: false,
                        error: 'Nigeria Voter\'s ID (PVC) must be 19 alphanumeric characters',
                    };
                }
                break;
        }
    }

    return { valid: true };
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob: string | Date): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

/**
 * Sanitize and format full name
 */
export function sanitizeFullName(name: string): string {
    return name
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Validate that full name matches expected format
 */
export function validateFullName(name: string): { valid: boolean; error?: string } {
    const trimmed = name.trim();

    if (trimmed.length < 3) {
        return { valid: false, error: 'Full name must be at least 3 characters' };
    }

    if (trimmed.length > 100) {
        return { valid: false, error: 'Full name must not exceed 100 characters' };
    }

    // Check for at least first and last name
    const nameParts = trimmed.split(/\s+/);
    if (nameParts.length < 2) {
        return { valid: false, error: 'Please provide both first and last name' };
    }

    // Check for invalid characters
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
        return {
            valid: false,
            error: 'Name can only contain letters, spaces, hyphens, and apostrophes',
        };
    }

    return { valid: true };
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Check if user is eligible for KYC (18+)
 */
export function isEligibleForKYC(dob: string | Date): boolean {
    return calculateAge(dob) >= 18;
}
