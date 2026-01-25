"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { NewPasswordSchema } from "@/schemas";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendPasswordChangeConfirmationEmail } from "@/lib/mail";

export const newPassword = async (
    values: z.infer<typeof NewPasswordSchema>,
    token?: string | null
) => {
    if (!token) {
        return { error: "Missing token!" };
    }

    const validatedFields = NewPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { fieldErrors: validatedFields.error.flatten().fieldErrors };
    }

    const { password } = validatedFields.data;

    // 1. Check if token exists
    const { data: existingToken } = await supabaseAdmin
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .maybeSingle();

    if (!existingToken) {
        return { error: "Invalid token!" };
    }

    // 2. Check if expired
    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" };
    }

    // 3. Get user
    const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', existingToken.email)
        .maybeSingle();

    if (!existingUser) {
        return { error: "Email does not exist!" };
    }

    // 4. Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Update password and invalidate other sessions by updating hash
    const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
            password_hash: hashedPassword,
            updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id);

    if (updateError) {
        console.error("[NEW_PASSWORD_ERROR]", updateError);
        return { error: "Failed to update password!" };
    }

    // 6. Delete token
    await supabaseAdmin
        .from('password_reset_tokens')
        .delete()
        .eq('id', existingToken.id);

    // 7. Notify user
    try {
        await sendPasswordChangeConfirmationEmail(existingUser.email);
    } catch (e) {
        console.warn("[EMAIL_ERROR] Confirmation email failed after password change:", e);
    }

    return { success: "Password updated successfully!" };
};
