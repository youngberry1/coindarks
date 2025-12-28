'use server';

import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';
import { sendKYCRejectionEmail } from '@/lib/mail';

interface RejectKYCResult {
    success: boolean;
    error?: string;
}

/**
 * Reject KYC submission with reason
 * Role: ADMIN, FINANCE only
 */
export async function rejectKYC(kycId: string, rejectionReason: string): Promise<RejectKYCResult> {
    try {
        // 1. Validate session and role
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized. Please log in.' };
        }

        // Only ADMIN and FINANCE can reject
        if (!['ADMIN', 'FINANCE'].includes(session.user.role || '')) {
            return { success: false, error: 'Access denied. Admin or Finance role required.' };
        }

        // 2. Validate rejection reason
        if (!rejectionReason || rejectionReason.trim().length < 10) {
            return { success: false, error: 'Rejection reason must be at least 10 characters.' };
        }

        if (rejectionReason.length > 500) {
            return { success: false, error: 'Rejection reason must not exceed 500 characters.' };
        }

        // 3. Fetch KYC record
        const { data: kyc, error: fetchError } = await supabase
            .from('KYC')
            .select(`
        *,
        User:userId (
          id,
          email,
          firstName,
          lastName
        )
      `)
            .eq('id', kycId)
            .single();

        if (fetchError || !kyc) {
            console.error('KYC fetch error:', fetchError);
            return { success: false, error: 'KYC submission not found.' };
        }

        // 4. Check if already approved (can't reject approved KYC)
        if (kyc.status === 'APPROVED') {
            return { success: false, error: 'Cannot reject an approved KYC.' };
        }

        // 5. Update KYC status
        const { error: updateError } = await supabase
            .from('KYC')
            .update({
                status: 'REJECTED',
                reviewedBy: session.user.id,
                reviewedAt: new Date().toISOString(),
                rejectionReason: rejectionReason.trim(),
            })
            .eq('id', kycId);

        if (updateError) {
            console.error('KYC update error:', updateError);
            return { success: false, error: 'Failed to reject KYC.' };
        }

        // 6. Update User kycStatus
        const { error: userUpdateError } = await supabase
            .from('User')
            .update({ kycStatus: 'REJECTED' })
            .eq('id', kyc.userId);

        if (userUpdateError) {
            console.error('User update error:', userUpdateError);
            // Don't fail the whole operation
        }

        // 7. Log audit trail
        await supabase.from('AuditLog').insert({
            userId: session.user.id,
            action: 'KYC_REJECTED',
            metadata: {
                kycId,
                rejectedUserId: kyc.userId,
                reviewerRole: session.user.role,
                reason: rejectionReason.trim(),
            },
        });

        // 8. Send rejection email with reason
        try {
            const user = kyc.User as any;
            await sendKYCRejectionEmail(
                user.email,
                `${user.firstName} ${user.lastName}`,
                rejectionReason.trim()
            );
        } catch (emailError) {
            console.error('Email error:', emailError);
            // Don't fail the operation if email fails
        }

        return { success: true };
    } catch (error) {
        console.error('Reject KYC exception:', error);
        return {
            success: false,
            error: 'An unexpected error occurred.',
        };
    }
}
