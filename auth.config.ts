import type { NextAuthConfig } from "next-auth";
import { UserRole, UserStatus } from "@/types/db";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role;
                token.status = user.status;
                token.emailVerified = user.emailVerified;
            }

            // For every request, verify the user still exists and is active
            // This ensures that deleting/banning a user from the DB reflects immediately
            if (token.id) {
                try {
                    const { data: dbUser, error } = await supabaseAdmin
                        .from('users')
                        .select('id, status, role, email_verified')
                        .eq('id', token.id)
                        .maybeSingle();

                    if (error || !dbUser || dbUser.status === "BANNED") {
                        return null;
                    }

                    // Update token with latest data if needed (e.g., role change)
                    token.role = dbUser.role;
                    token.status = dbUser.status;
                    token.emailVerified = dbUser.email_verified;
                } catch (e) {
                    console.error("[AUTH] JWT Validation Error:", e);
                    // On error, we keep the token but log it
                    // Alternatively, return null to be safe
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.role = token.role as UserRole;
                session.user.status = token.status as UserStatus;
                session.user.emailVerified = token.emailVerified ? new Date(token.emailVerified as string) : null;
            }
            return session;
        },
    },
    // Providers array is intentionally empty here
    // The actual Credentials provider is defined in auth.ts
    // This split config pattern allows middleware to import this file without heavy dependencies
    providers: [],
} satisfies NextAuthConfig;
