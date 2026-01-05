"use server";

import * as z from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password } = validatedFields.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Pre-verification check: Check if user exists and is verified
    // Use supabaseAdmin to bypass RLS for this internal check
    try {
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('email, email_verified')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (user && !user.email_verified) {
            return { error: "EmailNotVerified" };
        }
    } catch {
        // Silently continue if check fails
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        return { success: "Logged in!" };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials!" };
                default:
                    return { error: "Something went wrong!" };
            }
        }

        throw error;
    }
};
