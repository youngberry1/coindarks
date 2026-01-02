
"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { uploadProfileImage } from "@/lib/profile-storage";
import { revalidatePath } from "next/cache";

export async function updateProfileImage(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const file = formData.get("image") as File;
    if (!file) return { error: "No image provided" };

    try {
        const userId = session.user.id;

        // 1. Upload to storage
        const uploadResult = await uploadProfileImage(file, userId);
        if (!uploadResult.success) {
            return { error: uploadResult.error };
        }

        // 2. Update database
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                profile_image: uploadResult.path,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        // 3. Revalidate paths
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/settings");

        return { success: true, imageUrl: uploadResult.path };
    } catch (error: unknown) {
        console.error("Profile Update Error:", error);
        return { error: error instanceof Error ? error.message : "Failed to update profile image" };
    }
}
