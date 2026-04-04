import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * NextAuth proxy for route protection.
 * Uses NextAuth's built-in session handling via callback URL.
 */
export default function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for authenticated session via cookie
  const hasSession = request.cookies.has("next-auth.session-token") 
    || request.cookies.has("__Secure-next-auth.session-token");

  // Admin routes require admin role (checked via callback URL param)
  if (pathname.startsWith("/admin")) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    // Role check happens server-side in API routes
  }

  // Protected user routes require authentication.
  const protectedPaths = ["/profile", "/cart", "/checkout"];
  const isProtectedRoute = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (isProtectedRoute && !hasSession) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl),
    );
  }

  // Auth routes redirect authenticated users to home.
  const authPaths = ["/login", "/signup", "/reset-password"];
  const isAuthRoute = authPaths.includes(pathname);

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
