"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updatePassword(currentPassword: string, newPassword: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        // 1. Fetch user password hash
        const { data: user } = await supabase
            .from('users')
            .select('password_hash')
            .eq('id', session.user.id)
            .single();

        if (!user || !user.password_hash) {
            return { error: "User not found" };
        }

        // 2. Verify current password
        const passwordsMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!passwordsMatch) {
            return { error: "Current password is incorrect" };
        }

        // 3. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4. Update in database
        const { error } = await supabase
            .from('users')
            .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
            .eq('id', session.user.id);

        if (error) throw error;

        revalidatePath("/dashboard/settings");
        return { success: "Password updated successfully!" };
    } catch {
        return { error: "Failed to update password" };
    }
}
