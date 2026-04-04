import type { NextAuthConfig } from "next-auth"

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

      // Protected routes that require authentication
      const protectedRoutes = [
        "/dashboard",
        "/admin",
        "/profile",
        "/subscriptions",
        "/invoices",
        "/checkout",
      ]

      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
      )

      // Admin routes require admin role
      if (pathname.startsWith("/admin")) {
        const isAdmin = auth?.user && (auth.user as any)?.role === "admin"
        if (!isLoggedIn) {
          return false // Will redirect to /login
        }
        if (!isAdmin) {
          return Response.redirect(new URL("/dashboard", nextUrl))
        }
        return true
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
        return Response.redirect(new URL("/dashboard", nextUrl))
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
        return { ...session, user: undefined } as any
      }
      return session
    },
  },
  providers: [], // Providers are added in lib/auth.ts
} satisfies NextAuthConfig
