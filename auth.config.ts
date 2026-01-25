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
                    // Implement a timeout to prevent slow DB from hanging the app
                    const dbCheck = supabaseAdmin
                        .from('users')
                        .select('id, status, role, email_verified')
                        .eq('id', token.id)
                        .maybeSingle();

                    const timeout = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Timeout")), 5000)
                    );

                    const { data: dbUser, error } = await Promise.race([dbCheck, timeout]) as any;

                    if (error || !dbUser || dbUser.status === "BANNED") {
                        // User is gone or banned, invalidating token
                        return null;
                    }

                    // Update token with latest data if needed (e.g., role change)
                    token.role = dbUser.role;
                    token.status = dbUser.status;
                    token.emailVerified = dbUser.email_verified;
                } catch (e) {
                    console.error("[AUTH] JWT Validation Error or Timeout:", e);
                    // On error/timeout, we allow the request to proceed with existing token
                    // to prevent total lockout if Supabase is temporarily slow
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
