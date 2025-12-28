'use server';

import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';
import { KYCSubmission } from '@/types/kyc';

interface GetPendingKYCResult {
    success: boolean;
    kycs?: KYCSubmission[];
    total?: number;
    error?: string;
}

interface KYCFilters {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNVERIFIED';
    country?: string;
    searchQuery?: string;
    page?: number;
    limit?: number;
}

/**
 * Get pending KYC submissions for review
 * Role: ADMIN, SUPPORT only
 */
export async function getPendingKYC(filters: KYCFilters = {}): Promise<GetPendingKYCResult> {
    try {
        // 1. Validate session and role
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized. Please log in.' };
        }

        // Only ADMIN and SUPPORT can view all KYCs
        if (!['ADMIN', 'SUPPORT'].includes(session.user.role || '')) {
            return { success: false, error: 'Access denied. Admin or Support role required.' };
        }

        // 2. Build query
        let query = supabase
            .from('KYC')
            .select(`
        *,
        User:userId (
          id,
          firstName,
          lastName,
          email
        )
      `, { count: 'exact' });

        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.country) {
            query = query.eq('country', filters.country);
        }

        if (filters.searchQuery) {
            query = query.or(`fullName.ilike.%${filters.searchQuery}%,idNumber.ilike.%${filters.searchQuery}%`);
        }

        // Pagination
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        query = query
            .range(from, to)
            .order('submittedAt', { ascending: false });

        // 3. Execute query
        const { data, error, count } = await query;

        if (error) {
            console.error('Get pending KYC error:', error);
            return { success: false, error: 'Failed to fetch KYC submissions.' };
        }

        return {
            success: true,
            kycs: data as any,
            total: count || 0,
        };
    } catch (error) {
        console.error('Get pending KYC exception:', error);
        return {
            success: false,
            error: 'An unexpected error occurred.',
        };
    }
}
