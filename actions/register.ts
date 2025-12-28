"use server";

import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { RegisterSchema } from "@/schemas";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { UserRole } from "@/types/db";

const STAFF_EMAILS: Record<string, UserRole> = {
    "admin@coindarks.com": "ADMIN",
    "finance@coindarks.com": "FINANCE",
    "support@coindarks.com": "SUPPORT",
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
        const { data: existingUser } = await supabase
            .from('User')
            .select('email')
            .eq('email', email)
            .maybeSingle();

        if (existingUser) {
            return { error: { email: ["User with this email already exists"] } };
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const { error: createError } = await supabase.from('User').insert({
            email,
            firstName,
            middleName,
            lastName,
            passwordHash: hashedPassword,
            role,
            status: "ACTIVE",
            updatedAt: new Date().toISOString(),
        });

        if (createError) {
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
