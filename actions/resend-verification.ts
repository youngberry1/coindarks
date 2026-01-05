"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const resendVerification = async (email: string) => {
    try {
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('email, email_verified')
            .eq('email', email)
            .maybeSingle();

        if (!user) {
            return { error: "Email not found!" };
        }

        if (user.email_verified) {
            return { error: "Email already verified!" };
        }

        const verificationToken = await generateVerificationToken(email);
        await sendVerificationEmail(verificationToken.email, verificationToken.token);

        return { success: "Verification email resent! Please check your inbox and spam folder." };
    } catch (error) {
        console.error("Resend verification error:", error);
        return { error: "Something went wrong!" };
    }
};
