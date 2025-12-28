import NextAuth from "next-auth";
import { supabase } from "@/lib/supabase";
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

                    console.log(`[AUTH CHECK] Attempting login for: ${email}`);

                    try {
                        const { data: user } = await supabase
                            .from('User')
                            .select('*')
                            .eq('email', email)
                            .maybeSingle();

                        if (!user) {
                            console.log(`[AUTH CHECK] ❌ User not found in DB.`);
                            return null;
                        }

                        // Check status
                        if (user.status === "SUSPENDED" || user.status === "DELETED") {
                            console.log(`[AUTH CHECK] ❌ User is ${user.status}.`);
                            return null;
                        }

                        console.log(`[AUTH CHECK] ✅ User found: ${user.id}, Role: ${user.role}`);

                        if (!user.passwordHash) {
                            console.log(`[AUTH CHECK] ❌ User has no password hash.`);
                            return null;
                        }

                        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

                        if (passwordsMatch) {
                            console.log(`[AUTH CHECK] ✅ Password valid!`);

                            // Construct name from parts for session
                            const fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ");

                            return {
                                id: user.id,
                                email: user.email,
                                name: fullName,
                                role: user.role,
                                status: user.status,
                                emailVerified: user.emailVerified,
                            };
                        } else {
                            console.log(`[AUTH CHECK] ❌ Password mismatch.`);
                        }
                    } catch (error) {
                        console.error(`[AUTH CHECK] 💥 DB Error during verify:`, error);
                        return null;
                    }
                }

                return null;
            },
        }),
    ],
});
