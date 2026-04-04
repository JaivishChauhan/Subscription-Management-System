import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * NextAuth middleware for route protection.
 * Enforces authentication on protected routes and role-based access on admin routes.
 *
 * @security
 * - `/admin/*` routes require admin or internal role
 * - `/profile/*`, `/cart`, `/checkout/*` require authenticated user
 * - `/login`, `/signup` redirect authenticated users to home
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const userRole = req.auth?.user?.role;

  const pathname = nextUrl.pathname;

  // Admin routes — require admin or internal role
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "admin" && userRole !== "internal") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Protected user routes — require authentication
  const protectedPaths = ["/profile", "/cart", "/checkout"];
  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (isProtectedRoute && !isAuthenticated) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl),
    );
  }

  // Auth routes — redirect authenticated users to home
  const authPaths = ["/login", "/signup", "/reset-password"];
  const isAuthRoute = authPaths.includes(pathname);

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (they handle their own auth)
     * - static files (_next/static, favicon, images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
