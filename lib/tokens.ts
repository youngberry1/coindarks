import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";

export const generateVerificationToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    // Check for existing token
    const { data: existingToken } = await supabase
        .from('VerificationToken')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (existingToken) {
        await supabase
            .from('VerificationToken')
            .delete()
            .eq('id', existingToken.id);
    }

    const { data: verificationToken, error } = await supabase
        .from('VerificationToken')
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

    const { data: existingToken } = await supabase
        .from('PasswordResetToken')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (existingToken) {
        await supabase
            .from('PasswordResetToken')
            .delete()
            .eq('id', existingToken.id);
    }

    const { data: passwordResetToken, error } = await supabase
        .from('PasswordResetToken')
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
