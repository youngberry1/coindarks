'use server';

import { auth } from '@/auth';
import { supabase } from '@/lib/supabase';
import { uploadKYCDocument } from '@/lib/kyc-storage';
import { KYCFormSchema, validateIdNumber, sanitizeFullName } from '@/lib/kyc-validation';
import { sendKYCSubmissionEmail } from '@/lib/mail';

interface SubmitKYCResult {
    success: boolean;
    kycId?: string;
    error?: string;
}

/**
 * Submit KYC for verification
 * Role: USER only
 */
export async function submitKYC(formData: FormData): Promise<SubmitKYCResult> {
    try {
        // 1. Validate session
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized. Please log in.' };
        }

        // Only USER role can submit KYC
        if (session.user.role !== 'USER') {
            return { success: false, error: 'Only users can submit KYC applications.' };
        }

        // 2. Check if KYC already exists
        const { data: existingKYC } = await supabase
            .from('KYC')
            .select('id, status')
            .eq('userId', session.user.id)
            .single();

        if (existingKYC) {
            if (existingKYC.status === 'PENDING') {
                return { success: false, error: 'You already have a pending KYC submission.' };
            }
            if (existingKYC.status === 'APPROVED') {
                return { success: false, error: 'Your KYC is already approved.' };
            }
            // If REJECTED or UNVERIFIED, allow resubmission
        }

        // 3. Extract and validate form data
        const rawData = {
            fullName: formData.get('fullName') as string,
            dob: formData.get('dob') as string,
            country: formData.get('country') as string,
            idType: formData.get('idType') as string,
            idNumber: formData.get('idNumber') as string,
        };

        const validation = KYCFormSchema.safeParse(rawData);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error.issues[0]?.message || 'Invalid form data',
            };
        }

        const validatedData = validation.data;

        // 4. Validate ID number format
        const idValidation = validateIdNumber(
            validatedData.idNumber,
            validatedData.country,
            validatedData.idType
        );

        if (!idValidation.valid) {
            return { success: false, error: idValidation.error };
        }

        // 5. Get and validate files
        const idFrontFile = formData.get('idFront') as File;
        const selfieFile = formData.get('selfie') as File;

        if (!idFrontFile || !selfieFile) {
            return { success: false, error: 'Both ID front and selfie images are required.' };
        }

        // 6. Upload ID front image
        const idFrontUpload = await uploadKYCDocument(idFrontFile, session.user.id, 'id_front');
        if (!idFrontUpload.success) {
            return { success: false, error: `ID Front: ${idFrontUpload.error}` };
        }

        // 7. Upload selfie image
        const selfieUpload = await uploadKYCDocument(selfieFile, session.user.id, 'selfie');
        if (!selfieUpload.success) {
            // Cleanup: delete the already uploaded ID front
            // Note: We'll handle cleanup in a separate function if needed
            return { success: false, error: `Selfie: ${selfieUpload.error}` };
        }

        // 8. Prepare document metadata for audit trail
        const documentMetadata = {
            idFrontSize: idFrontFile.size,
            idFrontType: idFrontFile.type,
            idFrontUploadedAt: new Date().toISOString(),
            selfieSize: selfieFile.size,
            selfieType: selfieFile.type,
            selfieUploadedAt: new Date().toISOString(),
        };

        // 9. Create or update KYC record
        const kycData = {
            userId: session.user.id,
            fullName: sanitizeFullName(validatedData.fullName),
            dob: new Date(validatedData.dob).toISOString(),
            country: validatedData.country,
            idType: validatedData.idType,
            idNumber: validatedData.idNumber.toUpperCase(),
            idFrontUrl: idFrontUpload.path!,
            selfieUrl: selfieUpload.path!,
            status: 'PENDING' as const,
            documentMetadata,
            submittedAt: new Date().toISOString(),
        };

        let kycId: string;

        if (existingKYC) {
            // Update existing KYC (resubmission after rejection)
            const { data, error } = await supabase
                .from('KYC')
                .update(kycData)
                .eq('id', existingKYC.id)
                .select('id')
                .single();

            if (error) {
                console.error('KYC update error:', error);
                return { success: false, error: 'Failed to update KYC submission.' };
            }

            kycId = data.id;
        } else {
            // Create new KYC record
            const { data, error } = await supabase
                .from('KYC')
                .insert(kycData)
                .select('id')
                .single();

            if (error) {
                console.error('KYC insert error:', error);
                return { success: false, error: 'Failed to create KYC submission.' };
            }

            kycId = data.id;
        }

        // 10. Update User kycStatus to PENDING
        const { error: userUpdateError } = await supabase
            .from('User')
            .update({ kycStatus: 'PENDING' })
            .eq('id', session.user.id);

        if (userUpdateError) {
            console.error('User update error:', userUpdateError);
            // Don't fail the whole operation, just log it
        }

        // 11. Log audit trail
        await supabase.from('AuditLog').insert({
            userId: session.user.id,
            action: 'KYC_SUBMITTED',
            metadata: {
                kycId,
                country: validatedData.country,
                idType: validatedData.idType,
            },
        });

        // 12. Send confirmation email
        try {
            await sendKYCSubmissionEmail(session.user.email!, validatedData.fullName);
        } catch (emailError) {
            console.error('Email error:', emailError);
            // Don't fail the operation if email fails
        }

        return {
            success: true,
            kycId,
        };
    } catch (error) {
        console.error('Submit KYC exception:', error);
        return {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
        };
    }
}
