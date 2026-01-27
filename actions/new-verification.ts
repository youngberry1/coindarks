"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const newVerification = async (token: string) => {
    try {
        const { data: existingToken } = await supabaseAdmin
            .from('verification_tokens')
            .select('*')
            .eq('token', token)
            .maybeSingle();

        if (!existingToken) {
            return { error: "This verification link is invalid or has already been used. Please request a new verification email." };
        }

        const hasExpired = new Date(existingToken.expires) < new Date();

        if (hasExpired) {
            return { error: "This verification link has expired. Please request a new verification email to continue." };
        }

        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('email')
            .eq('email', existingToken.email)
            .maybeSingle();

        if (!existingUser) {
            return { error: "We couldn't find an account with this email address. Please contact support if you need assistance." };
        }

        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                email_verified: new Date().toISOString(),
                email: existingToken.email,
            })
            .eq('email', existingToken.email);

        if (updateError) {
            console.error("Verification update error:", updateError);
            return { error: "We couldn't complete your email verification. Please try again or contact support." };
        }

        await supabaseAdmin
            .from('verification_tokens')
            .delete()
            .eq('id', existingToken.id);

        return { success: "Email verified!" };
    } catch (error) {
        console.error("New verification error:", error);
        return { error: "We encountered an unexpected error. Please try again or contact support if the problem persists." };
    }
};
