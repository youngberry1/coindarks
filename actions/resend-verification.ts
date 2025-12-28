"use server";

import { supabase } from "@/lib/supabase";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const resendVerification = async (email: string) => {
    try {
        const { data: user } = await supabase
            .from('User')
            .select('email, emailVerified')
            .eq('email', email)
            .maybeSingle();

        if (!user) {
            return { error: "Email not found!" };
        }

        if (user.emailVerified) {
            return { error: "Email already verified!" };
        }

        const verificationToken = await generateVerificationToken(email);
        await sendVerificationEmail(verificationToken.email, verificationToken.token);

        return { success: "Verification email resent!" };
    } catch (error) {
        console.error("Resend verification error:", error);
        return { error: "Something went wrong!" };
    }
};
