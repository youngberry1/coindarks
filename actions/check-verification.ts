"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const checkVerification = async (email: string) => {
    try {
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('email_verified')
            .eq('email', email)
            .maybeSingle();

        if (!user) {
            return { error: "User not found!" };
        }

        if (user.email_verified) {
            return { success: true, verified: true };
        }

        return { success: true, verified: false };
    } catch (error) {
        console.error("Check verification error:", error);
        return { error: "Something went wrong during the status check." };
    }
};
