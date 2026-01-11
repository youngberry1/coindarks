import type { NextAuthConfig } from "next-auth";
import { UserRole, UserStatus } from "@/types/db";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role;
                token.status = user.status;
                token.emailVerified = user.emailVerified;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                // Re-verify the user exists and is active in the database
                // This prevents deleted or suspended users from staying logged in
                const { data: user } = await supabaseAdmin
                    .from('users')
                    .select('id, status, role, email_verified')
                    .eq('id', token.id)
                    .maybeSingle();

                if (!user || user.status === "BANNED") {
                    // Sign out the user by returning null
                    // This forces middleware and hooks to treat the user as unauthenticated
                    return null as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                }

                session.user.id = user.id;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.role = user.role as UserRole;
                session.user.status = user.status as UserStatus;
                session.user.emailVerified = user.email_verified;
            }
            return session;
        },
    },
    // Providers array is intentionally empty here
    // The actual Credentials provider is defined in auth.ts
    // This split config pattern allows middleware to import this file without heavy dependencies
    providers: [],
} satisfies NextAuthConfig;
