"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { sendPasswordChangeConfirmationEmail } from "@/lib/mail";

export async function updatePassword(currentPassword: string, newPassword: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        // 1. Fetch user password hash and email using admin client to bypass RLS
        const { data: user, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('password_hash, email')
            .eq('id', session.user.id)
            .single();

        if (fetchError || !user || !user.password_hash || !user.email) {
            return { error: "User data not found" };
        }

        // 2. Verify current password
        const passwordsMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!passwordsMatch) {
            return { error: "Current password is incorrect" };
        }

        // 3. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Update in database
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                password_hash: hashedPassword,
                updated_at: new Date().toISOString()
            })
            .eq('id', session.user.id);

        if (updateError) throw updateError;

        // 5. Send confirmation email (optional: don't block success on email)
        try {
            await sendPasswordChangeConfirmationEmail(user.email);
        } catch (emailErr) {
            console.error("Password update email failed:", emailErr);
        }

        revalidatePath("/dashboard/settings");
        return { success: "Password updated successfully!" };
    } catch (error) {
        console.error("Password update error:", error);
        return { error: "Failed to update password. Please try again." };
    }
}
