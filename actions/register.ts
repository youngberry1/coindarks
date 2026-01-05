"use server";

import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";
import { RegisterSchema } from "@/schemas";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { UserRole } from "@/types/db";

const STAFF_EMAILS: Record<string, UserRole> = {
    "admin@coindarks.com": "ADMIN",
};

export async function register(formData: z.infer<typeof RegisterSchema>) {
    try {
        const validatedFields = RegisterSchema.safeParse(formData);

        if (!validatedFields.success) {
            return { error: validatedFields.error.flatten().fieldErrors };
        }

        const { email, password, firstName, middleName, lastName } = validatedFields.data;

        // Determine role based on bootstrap registry
        const role: UserRole = STAFF_EMAILS[email.toLowerCase()] || "USER";

        // Check if user already exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('email, email_verified')
            .eq('email', email)
            .maybeSingle();

        if (existingUser) {
            if (!existingUser.email_verified) {
                const verificationToken = await generateVerificationToken(email);
                await sendVerificationEmail(verificationToken.email, verificationToken.token);
                return { success: "A new verification email has been sent to your inbox (check spam folder). Please verify your email to log in." };
            }
            return { error: { email: ["User with this email already exists"] } };
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const { error: createError } = await supabaseAdmin.from('users').insert({
            email,
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            password_hash: hashedPassword,
            role,
            status: "ACTIVE",
            updated_at: new Date().toISOString(),
        });

        if (createError) {
            if (createError.code === '23505') {
                return { error: { email: ["User with this email already exists"] } };
            }
            console.error("Database error creating user:", createError);
            return { error: { message: "Failed to create user account" } };
        }

        const verificationToken = await generateVerificationToken(email);
        await sendVerificationEmail(verificationToken.email, verificationToken.token);

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: { message: "Something went wrong during registration" } };
    }
}
