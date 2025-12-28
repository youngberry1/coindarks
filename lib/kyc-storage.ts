import { supabase } from './supabase';
import { KYC_FILE_CONSTRAINTS, SIGNED_URL_EXPIRY } from '@/types/kyc';

/**
 * KYC Storage Service
 * Handles secure file uploads to Supabase Storage for KYC documents
 */

interface UploadResult {
    success: boolean;
    path?: string;
    error?: string;
}

interface SignedUrlResult {
    success: boolean;
    url?: string;
    expiresIn?: number;
    error?: string;
}

/**
 * Validate file before upload
 * Checks file type, size, and magic bytes
 */
export async function validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
    // Check file size
    if (file.size > KYC_FILE_CONSTRAINTS.MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File size exceeds 5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        };
    }

    // Check MIME type
    if (!KYC_FILE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as typeof KYC_FILE_CONSTRAINTS.ALLOWED_TYPES[number])) {
        return {
            valid: false,
            error: `Invalid file type. Only JPG, PNG, and WebP images are allowed.`,
        };
    }

    // Check file extension
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!KYC_FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(extension as typeof KYC_FILE_CONSTRAINTS.ALLOWED_EXTENSIONS[number])) {
        return {
            valid: false,
            error: `Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed.`,
        };
    }

    // Magic bytes validation (prevent fake extensions)
    const magicBytes = await validateMagicBytes(file);
    if (!magicBytes.valid) {
        return {
            valid: false,
            error: magicBytes.error || 'Invalid file format detected',
        };
    }

    return { valid: true };
}

/**
 * Validate file magic bytes to prevent fake extensions
 */
async function validateMagicBytes(file: File): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4);
            let header = '';
            for (let i = 0; i < arr.length; i++) {
                header += arr[i].toString(16).padStart(2, '0');
            }

            // Check magic bytes for common image formats
            const validHeaders = [
                'ffd8ffe0', // JPEG
                'ffd8ffe1', // JPEG
                'ffd8ffe2', // JPEG
                'ffd8ffe3', // JPEG
                'ffd8ffe8', // JPEG
                '89504e47', // PNG
                '52494646', // WebP (RIFF)
            ];

            const isValid = validHeaders.some(validHeader => header.startsWith(validHeader));

            if (!isValid) {
                resolve({
                    valid: false,
                    error: 'File appears to be corrupted or has a fake extension',
                });
            } else {
                resolve({ valid: true });
            }
        };

        reader.onerror = () => {
            resolve({
                valid: false,
                error: 'Failed to read file',
            });
        };

        reader.readAsArrayBuffer(file.slice(0, 4));
    });
}

/**
 * Generate unique filename with timestamp
 */
function generateFileName(userId: string, fileType: 'id_front' | 'selfie', extension: string): string {
    const timestamp = Date.now();
    return `${userId}/${fileType}_${timestamp}${extension}`;
}

/**
 * Upload KYC document to Supabase Storage
 */
export async function uploadKYCDocument(
    file: File,
    userId: string,
    documentType: 'id_front' | 'selfie'
): Promise<UploadResult> {
    try {
        // Validate file
        const validation = await validateFile(file);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error,
            };
        }

        // Generate secure filename
        const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const fileName = generateFileName(userId, documentType, extension);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('kyc-documents')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false, // Don't overwrite existing files
            });

        if (error) {
            console.error('Upload error:', error);
            return {
                success: false,
                error: error.message || 'Failed to upload file',
            };
        }

        return {
            success: true,
            path: data.path,
        };
    } catch (error) {
        console.error('Upload exception:', error);
        return {
            success: false,
            error: 'An unexpected error occurred during upload',
        };
    }
}

/**
 * Generate signed URL for viewing KYC document
 * Only accessible by ADMIN, SUPPORT, and FINANCE roles
 */
export async function generateSignedUrl(filePath: string): Promise<SignedUrlResult> {
    try {
        const { data, error } = await supabase.storage
            .from('kyc-documents')
            .createSignedUrl(filePath, SIGNED_URL_EXPIRY);

        if (error) {
            console.error('Signed URL error:', error);
            return {
                success: false,
                error: error.message || 'Failed to generate signed URL',
            };
        }

        return {
            success: true,
            url: data.signedUrl,
            expiresIn: SIGNED_URL_EXPIRY,
        };
    } catch (error) {
        console.error('Signed URL exception:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Delete KYC document from storage
 * Only allowed if KYC status is UNVERIFIED or REJECTED
 */
export async function deleteKYCDocument(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.storage
            .from('kyc-documents')
            .remove([filePath]);

        if (error) {
            console.error('Delete error:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete file',
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Delete exception:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Get file metadata (size, type) for audit trail
 */
export function getFileMetadata(file: File) {
    return {
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
    };
}
