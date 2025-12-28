'use server';

import { auth } from '@/auth';
import { generateSignedUrl as generateStorageSignedUrl } from '@/lib/kyc-storage';
import { supabase } from '@/lib/supabase';
import { SignedUrlResponse } from '@/types/kyc';

interface GenerateSignedUrlResult {
    success: boolean;
    idFrontUrl?: SignedUrlResponse;
    selfieUrl?: SignedUrlResponse;
    error?: string;
}

/**
 * Generate signed URLs for viewing KYC documents
 * Role: ADMIN, SUPPORT, FINANCE
 */
export async function generateSignedUrls(kycId: string): Promise<GenerateSignedUrlResult> {
    try {
        // 1. Validate session and role
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized. Please log in.' };
        }

        // Only ADMIN, SUPPORT, and FINANCE can view documents
        if (!['ADMIN', 'SUPPORT', 'FINANCE'].includes(session.user.role || '')) {
            return { success: false, error: 'Access denied. Admin, Support, or Finance role required.' };
        }

        // 2. Fetch KYC record to get file paths
        const { data: kyc, error: kycError } = await supabase
            .from('KYC')
            .select('idFrontUrl, selfieUrl, userId')
            .eq('id', kycId)
            .single();

        if (kycError || !kyc) {
            console.error('KYC fetch error:', kycError);
            return { success: false, error: 'KYC submission not found.' };
        }

        // 3. Generate signed URLs
        const idFrontResult = await generateStorageSignedUrl(kyc.idFrontUrl);
        const selfieResult = await generateStorageSignedUrl(kyc.selfieUrl);

        if (!idFrontResult.success || !selfieResult.success) {
            return {
                success: false,
                error: idFrontResult.error || selfieResult.error || 'Failed to generate signed URLs',
            };
        }

        // 4. Log audit trail
        await supabase.from('AuditLog').insert({
            userId: session.user.id,
            action: 'KYC_DOCUMENTS_VIEWED',
            metadata: {
                kycId,
                viewedUserId: kyc.userId,
                role: session.user.role,
            },
        });

        return {
            success: true,
            idFrontUrl: {
                url: idFrontResult.url!,
                expiresIn: idFrontResult.expiresIn!,
            },
            selfieUrl: {
                url: selfieResult.url!,
                expiresIn: selfieResult.expiresIn!,
            },
        };
    } catch (error) {
        console.error('Generate signed URLs exception:', error);
        return {
            success: false,
            error: 'An unexpected error occurred.',
        };
    }
}
