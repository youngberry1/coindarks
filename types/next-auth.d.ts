import { UserRole, UserStatus } from "@/types/db";
import { DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
    role: UserRole;
    status: UserStatus;
};

declare module "next-auth" {
    interface Session {
        user: ExtendedUser;
    }

    interface User {
        role: UserRole;
        status: UserStatus;
        emailVerified: Date | string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: UserRole;
        status: UserStatus;
        emailVerified: Date | string | null;
    }
}
