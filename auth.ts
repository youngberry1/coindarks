import NextAuth from "next-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";


export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    trustHost: true,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(1) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const normalizedEmail = email.toLowerCase().trim();

                    try {
                        const { data: user } = await supabaseAdmin
                            .from('users')
                            .select('*')
                            .eq('email', normalizedEmail)
                            .maybeSingle();

                        if (!user) {
                            return null;
                        }

                        // Check status
                        if (user.status === "BANNED") {
                            return null;
                        }

                        if (!user.password_hash) {
                            return null;
                        }

                        const passwordsMatch = await bcrypt.compare(password, user.password_hash);

                        if (passwordsMatch) {
                            // Construct name from parts for session
                            const fullName = [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" ");

                            return {
                                id: user.id,
                                email: user.email,
                                name: fullName,
                                role: user.role,
                                status: user.status,
                                emailVerified: user.email_verified,
                            };
                        }
                    } catch {
                        // Log error without exposing sensitive details
                        console.error('[AUTH] Database error during authentication');
                        return null;
                    }
                }

                return null;
            },
        }),
    ],
});
