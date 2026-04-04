import type { NextAuthConfig } from "next-auth"
import { getDefaultPortalPath, normalizeUserRole } from "@/lib/roles"

/**
 * Edge-compatible auth configuration for NextAuth v5.
 * This file is used by the middleware/proxy and doesn't import Node.js modules.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user?.id // Check for user.id to ensure full session
      const pathname = nextUrl.pathname
      const userRole = normalizeUserRole((auth?.user as { role?: string } | undefined)?.role)

      // Protected routes that require authentication
      const protectedRoutes = [
        "/auth/redirect",
        "/dashboard",
        "/admin",
        "/internal",
        "/profile",
        "/subscriptions",
        "/invoices",
        "/checkout",
      ]

      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      )

      const redirectToRoleHome = () =>
        Response.redirect(new URL(getDefaultPortalPath(userRole), nextUrl))

      // Admin routes require admin role
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
          return false // Will redirect to /login
        }
        if (userRole !== "admin") {
          return redirectToRoleHome()
        }
        return true
      }

      if (pathname.startsWith("/internal")) {
        if (!isLoggedIn) {
          return false
        }
        if (userRole !== "internal") {
          return redirectToRoleHome()
        }
        return true
      }

      if (
        isLoggedIn &&
        userRole !== "portal" &&
        (pathname.startsWith("/dashboard") ||
          pathname.startsWith("/subscriptions") ||
          pathname.startsWith("/invoices") ||
          pathname.startsWith("/checkout"))
      ) {
        return redirectToRoleHome()
      }

      // Redirect to login if accessing protected route without auth
      if (isProtectedRoute && !isLoggedIn) {
        return false // Will redirect to /login
      }

      // Redirect authenticated users away from auth pages
      if (
        isLoggedIn &&
        (pathname.startsWith("/login") || pathname.startsWith("/signup"))
      ) {
        return redirectToRoleHome()
      }

      return true
    },
    session({ session, token }) {
      console.log("[proxy session] token:", token, "session:", session)
      if (session.user && token && (token.id || token.sub)) {
        session.user.id = (token.id as string) || (token.sub as string) || ""
        ;(session.user as { role: string }).role =
          (token.role as string) ?? "portal"
      } else {
        return { ...session, user: undefined }
      }
      return session
    },
  },
  providers: [], // Providers are added in lib/auth.ts
} satisfies NextAuthConfig
