"use server";

import * as z from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { supabase } from "@/lib/supabase";

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password } = validatedFields.data;

    // Pre-verification check: Check if user exists and is verified
    // This is more reliable than waiting for Auth.js to callback
    try {
        const { data: user } = await supabase
            .from('User')
            .select('email, emailVerified')
            .eq('email', email)
            .maybeSingle();

        if (user && !user.emailVerified) {
            return { error: "EmailNotVerified" };
        }
    } catch (error) {
        console.error("Login verification check error:", error);
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
