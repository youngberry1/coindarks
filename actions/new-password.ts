"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { NewPasswordSchema } from "@/schemas";
import { supabase } from "@/lib/supabase";
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

    // Check if token exists
    const { data: existingToken } = await supabase
        .from('PasswordResetToken')
        .select('*')
        .eq('token', token)
        .maybeSingle();

    if (!existingToken) {
        return { error: "Invalid token!" };
    }

    // Check if expired
    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" };
    }

    // Get user
    const { data: existingUser } = await supabase
        .from('User')
        .select('*')
        .eq('email', existingToken.email)
        .maybeSingle();

    if (!existingUser) {
        return { error: "Email does not exist!" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password
    const { error: updateError } = await supabase
        .from('User')
        .update({ passwordHash: hashedPassword })
        .eq('id', existingUser.id);

    if (updateError) {
        return { error: "Failed to update password!" };
    }

    // Delete token
    await supabase
        .from('PasswordResetToken')
        .delete()
        .eq('id', existingToken.id);

    // Notify user of successful password change
    await sendPasswordChangeConfirmationEmail(existingUser.email);

    return { success: "Password updated successfully!" };
};
