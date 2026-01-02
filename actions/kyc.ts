"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { uploadKYCDocument, supabaseAdmin } from "@/lib/kyc-storage";

export async function submitKYC(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const documentType = formData.get("documentType") as string;
    const documentNumber = formData.get("documentNumber") as string;
    const frontFile = formData.get("front") as File;
    const backFile = formData.get("back") as File;
    const selfieFile = formData.get("selfie") as File;

    if (!documentType || !documentNumber || !frontFile || !selfieFile) {
        return { error: "Missing required fields or files" };
    }

    try {
        const userId = session.user.id;
        console.log("Processing KYC for user:", userId);

        // Check current status
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('kyc_status')
            .eq('id', userId)
            .single();

        console.log("Current User Status:", user?.kyc_status);

        if (user?.kyc_status === 'PENDING') {
            return { error: "Verification is currently under review. Please wait for a decision." };
        }
        if (user?.kyc_status === 'APPROVED') {
            return { error: "Your account is already verified." };
        }

        // 1. Upload files to Supabase Storage
        // Utilizes the admin client in lib/kyc-storage.ts to bypass RLS

        console.log("Starting Front ID upload...");
        const frontResult = await uploadKYCDocument(frontFile, userId, 'id_front');
        if (!frontResult.success) {
            console.error("Front ID upload failed:", frontResult.error);
            throw new Error(`Front ID upload failed: ${frontResult.error}`);
        }
        const frontPath = frontResult.path!;
        console.log("Front ID uploaded:", frontPath);

        console.log("Starting Selfie upload...");
        const selfieResult = await uploadKYCDocument(selfieFile, userId, 'selfie');
        if (!selfieResult.success) {
            console.error("Selfie upload failed:", selfieResult.error);
            throw new Error(`Selfie upload failed: ${selfieResult.error}`);
        }
        const selfiePath = selfieResult.path!;
        console.log("Selfie uploaded:", selfiePath);

        let backPath = "";
        if (backFile && backFile.size > 0) {
            console.log("Starting Back ID upload...");
            const backResult = await uploadKYCDocument(backFile, userId, 'id_back');
            if (!backResult.success) {
                console.error("Back ID upload failed:", backResult.error);
                throw new Error(`Back ID upload failed: ${backResult.error}`);
            }
            backPath = backResult.path!;
            console.log("Back ID uploaded:", backPath);
        }

        console.log("Creating KYC submission record in DB...");
        // 2. Create KYC submission record
        const { error: submissionError } = await supabaseAdmin
            .from('kyc_submissions')
            .insert({
                user_id: userId,
                document_type: documentType,
                document_number: documentNumber,
                document_front: frontPath,
                document_back: backPath || null,
                selfie: selfiePath,
                status: 'PENDING',
                submitted_at: new Date().toISOString()
            });

        if (submissionError) throw submissionError;

        // 3. Update user KYC status
        const { error: userUpdateError } = await supabaseAdmin
            .from('users')
            .update({ kyc_status: 'PENDING' })
            .eq('id', userId);

        if (userUpdateError) throw userUpdateError;

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/settings");

        return { success: true };
    } catch (error) {
        console.error("KYC Submission Error:", error);
        const message = error instanceof Error ? error.message : "Failed to submit KYC. Please ensure 'kyc-documents' bucket exists.";
        return { error: message };
    }
}
