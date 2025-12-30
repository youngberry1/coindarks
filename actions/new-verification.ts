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
            return { error: "Token does not exist!" };
        }

        const hasExpired = new Date(existingToken.expires) < new Date();

        if (hasExpired) {
            return { error: "Token has expired!" };
        }

        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('email')
            .eq('email', existingToken.email)
            .maybeSingle();

        if (!existingUser) {
            return { error: "Email does not exist!" };
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
            return { error: "Failed to verify email!" };
        }

        await supabaseAdmin
            .from('verification_tokens')
            .delete()
            .eq('id', existingToken.id);

        return { success: "Email verified!" };
    } catch (error) {
        console.error("New verification error:", error);
        return { error: "Something went wrong!" };
    }
};
