import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const generateVerificationToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    // Check for existing token
    const { data: existingToken } = await supabaseAdmin
        .from('verification_tokens')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (existingToken) {
        await supabaseAdmin
            .from('verification_tokens')
            .delete()
            .eq('id', existingToken.id);
    }

    const { data: verificationToken, error } = await supabaseAdmin
        .from('verification_tokens')
        .insert({
            email,
            token,
            expires: expires.toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating verification token:", error);
        throw new Error("Failed to create verification token");
    }

    return verificationToken;
};

export const generatePasswordResetToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    const { data: existingToken } = await supabaseAdmin
        .from('password_reset_tokens')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (existingToken) {
        await supabaseAdmin
            .from('password_reset_tokens')
            .delete()
            .eq('id', existingToken.id);
    }

    const { data: passwordResetToken, error } = await supabaseAdmin
        .from('password_reset_tokens')
        .insert({
            email,
            token,
            expires: expires.toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating password reset token:", error);
        throw new Error("Failed to create password reset token");
    }

    return passwordResetToken;
};
