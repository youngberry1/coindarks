'use server';

import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';
import { KYCSubmission } from '@/types/kyc';

interface GetKYCStatusResult {
    success: boolean;
    kyc?: KYCSubmission | null;
    error?: string;
}

/**
 * Get user's own KYC status
 * Role: USER only
 */
export async function getKYCStatus(): Promise<GetKYCStatusResult> {
    try {
        // 1. Validate session
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized. Please log in.' };
        }

        // 2. Fetch KYC record (users can only see their own)
        const { data, error } = await supabase
            .from('KYC')
            .select('*')
            .eq('userId', session.user.id)
            .single();

        if (error) {
            // If no KYC found, return null (not an error)
            if (error.code === 'PGRST116') {
                return { success: true, kyc: null };
            }
            console.error('Get KYC status error:', error);
            return { success: false, error: 'Failed to fetch KYC status.' };
        }

        // 3. Return KYC data (without document URLs for security)
        return {
            success: true,
            kyc: {
                ...data,
                // Don't expose actual file paths to client
                idFrontUrl: '',
                selfieUrl: '',
            } as KYCSubmission,
        };
    } catch (error) {
        console.error('Get KYC status exception:', error);
        return {
            success: false,
            error: 'An unexpected error occurred.',
        };
    }
}
