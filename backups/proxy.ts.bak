import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * NextAuth v5 middleware using edge-compatible configuration.
 * Handles route protection and authentication without Node.js crypto module.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes (handled separately)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
