
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || '', {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

export async function uploadProfileImage(file: File, userId: string): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

        // Remove old avatars for this user if needed (optional optimization)
        // For now, just upload new one

        const { error } = await supabaseAdmin.storage
            .from('avatars')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('avatars')
            .getPublicUrl(fileName);

        return { success: true, path: publicUrl };
    } catch (error: unknown) {
        console.error('Error uploading profile image:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to upload image' };
    }
}
