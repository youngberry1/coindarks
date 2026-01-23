"use server";

import { z } from "zod";
import { ForgotPasswordSchema } from "@/schemas";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

export const reset = async (values: z.infer<typeof ForgotPasswordSchema>) => {
    const validatedFields = ForgotPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message };
    }

    const { email } = validatedFields.data;

    const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (!existingUser) {
        return { error: "Email not found!" };
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(
        passwordResetToken.email,
        passwordResetToken.token
    );

    return { success: "Reset email sent!" };
};
