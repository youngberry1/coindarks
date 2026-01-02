import type { NextAuthConfig } from "next-auth";
import { UserRole, UserStatus } from "@/types/db";

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
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.role = token.role as UserRole;
                session.user.status = token.status as UserStatus;
                session.user.emailVerified = token.emailVerified as Date | null;
            }
            return session;
        },
    },
    providers: [], // Add providers with an empty array for now, they will be filled in auth.ts
} satisfies NextAuthConfig;
