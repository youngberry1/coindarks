import { supabase } from "@/lib/supabase";

export const getUserByEmail = async (email: string) => {
    try {
        const { data: user } = await supabase
            .from("User")
            .select("*")
            .eq("email", email)
            .maybeSingle();

        return user;
    } catch (error) {
        console.error("Error fetching user by email:", error);
        return null;
    }
};

export const getUserById = async (id: string) => {
    try {
        const { data: user } = await supabase
            .from("User")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        return user;
    } catch (error) {
        console.error("Error fetching user by id:", error);
        return null;
    }
};
