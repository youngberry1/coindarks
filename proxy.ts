import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export const { auth } = NextAuth(authConfig);

// Next.js 16 proxy convention
export const proxy = auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth?.user;

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isPublicRoute = ["/", "/verify", "/terms", "/privacy", "/help", "/faq"].includes(nextUrl.pathname) || nextUrl.pathname.startsWith("/academy") || nextUrl.pathname === "/api/market";
    const isAuthRoute = ["/login", "/register", "/forgot-password", "/new-password"].includes(nextUrl.pathname);
    const isAdminRoute = nextUrl.pathname.startsWith("/admin");

    if (isApiAuthRoute) return;

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return;
    }

    if (!isLoggedIn && !isPublicRoute) {
        return Response.redirect(new URL("/login", nextUrl));
    }

    // Role-based protection for Admin
    if (isAdminRoute) {
        if (req.auth?.user?.role !== "ADMIN") {
            return Response.redirect(new URL("/dashboard", nextUrl));
        }
    }

    return;
});

export default proxy;

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
