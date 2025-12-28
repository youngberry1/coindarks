'use server';

import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';
import { sendKYCApprovalEmail } from '@/lib/mail';

interface ApproveKYCResult {
    success: boolean;
    error?: string;
}

/**
 * Approve KYC submission
 * Role: ADMIN, FINANCE only
 */
export async function approveKYC(kycId: string): Promise<ApproveKYCResult> {
    try {
        // 1. Validate session and role
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized. Please log in.' };
        }

        // Only ADMIN and FINANCE can approve
        if (!['ADMIN', 'FINANCE'].includes(session.user.role || '')) {
            return { success: false, error: 'Access denied. Admin or Finance role required.' };
        }

        // 2. Fetch KYC record
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

        // 3. Check if already approved
        if (kyc.status === 'APPROVED') {
            return { success: false, error: 'This KYC is already approved.' };
        }

        // 4. Update KYC status
        const { error: updateError } = await supabase
            .from('KYC')
            .update({
                status: 'APPROVED',
                reviewedBy: session.user.id,
                reviewedAt: new Date().toISOString(),
                rejectionReason: null, // Clear any previous rejection reason
            })
            .eq('id', kycId);

        if (updateError) {
            console.error('KYC update error:', updateError);
            return { success: false, error: 'Failed to approve KYC.' };
        }

        // 5. Update User kycStatus
        const { error: userUpdateError } = await supabase
            .from('User')
            .update({ kycStatus: 'APPROVED' })
            .eq('id', kyc.userId);

        if (userUpdateError) {
            console.error('User update error:', userUpdateError);
            // Don't fail the whole operation
        }

        // 6. Log audit trail
        await supabase.from('AuditLog').insert({
            userId: session.user.id,
            action: 'KYC_APPROVED',
            metadata: {
                kycId,
                approvedUserId: kyc.userId,
                reviewerRole: session.user.role,
            },
        });

        // 7. Send approval email
        try {
            const user = kyc.User as { email: string; firstName: string; lastName: string };
            await sendKYCApprovalEmail(
                user.email,
                `${user.firstName} ${user.lastName}`
            );
        } catch (emailError) {
            console.error('Email error:', emailError);
            // Don't fail the operation if email fails
        }

        return { success: true };
    } catch (error) {
        console.error('Approve KYC exception:', error);
        return {
            success: false,
            error: 'An unexpected error occurred.',
        };
    }
}
