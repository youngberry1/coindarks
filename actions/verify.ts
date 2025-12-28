"use server";

import { supabase } from "@/lib/supabase";

export async function verifyEmail(token: string) {
    try {
        const { data: existingToken } = await supabase
            .from('VerificationToken')
            .select('*')
            .eq('token', token)
            .maybeSingle();

        if (!existingToken) {
            return { error: "Invalid token" };
        }

        const hasExpired = new Date(existingToken.expires) < new Date();

        if (hasExpired) {
            return { error: "Token has expired" };
        }

        const { data: existingUser } = await supabase
            .from('User')
            .select('id, email')
            .eq('email', existingToken.email)
            .maybeSingle();

        if (!existingUser) {
            return { error: "Email does not exist" };
        }

        // Update user
        const { error: updateError } = await supabase
            .from('User')
            .update({
                emailVerified: new Date().toISOString(),
                email: existingToken.email
            })
            .eq('id', existingUser.id);

        if (updateError) {
            console.error("Error updating user:", updateError);
            return { error: "Failed to verify email" };
        }

        // Delete token
        await supabase
            .from('VerificationToken')
            .delete()
            .eq('id', existingToken.id);

        return { success: "Email verified!" };
    } catch (error) {
        console.error("Verification error:", error);
        return { error: "Something went wrong during verification" };
    }
}
