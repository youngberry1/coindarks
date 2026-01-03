"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { AnnouncementSeverity } from "@/types/db";

export async function getAnnouncements() {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("announcements")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { data };
    } catch (error) {
        console.error("Error fetching announcements:", error);
        return { error: "Failed to fetch announcements" };
    }
}

export async function getActiveAnnouncements() {
    try {
        const { data, error } = await supabaseAdmin
            .from("announcements")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { data };
    } catch (error) {
        console.error("Error fetching active announcements:", error);
        return { error: "Failed to fetch active announcements" };
    }
}

export async function createAnnouncement(content: string, severity: AnnouncementSeverity) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    try {
        const { error } = await supabaseAdmin
            .from("announcements")
            .insert({
                content,
                severity,
                is_active: true,
                created_by: session.user.id
            });

        if (error) throw error;

        revalidatePath("/dashboard");
        revalidatePath("/admin/announcements");
        return { success: true };
    } catch (error) {
        console.error("Error creating announcement:", error);
        return { error: "Failed to create announcement" };
    }
}

export async function toggleAnnouncement(id: string, isActive: boolean) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    try {
        const { error } = await supabaseAdmin
            .from("announcements")
            .update({ is_active: isActive, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/dashboard");
        revalidatePath("/admin/announcements");
        return { success: true };
    } catch (error) {
        console.error("Error toggling announcement:", error);
        return { error: "Failed to update announcement" };
    }
}

export async function deleteAnnouncement(id: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    try {
        const { error } = await supabaseAdmin
            .from("announcements")
            .delete()
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/dashboard");
        revalidatePath("/admin/announcements");
        return { success: true };
    } catch (error) {
        console.error("Error deleting announcement:", error);
        return { error: "Failed to delete announcement" };
    }
}
