/**
 * @fileoverview Edge-compatible middleware for route protection.
 *
 * Reads the JWT session cookie using `jose` (Edge-safe).
 * No Node.js crypto, no adapter, no PrismaClient — pure JWT verification.
 *
 * Route logic:
 * - /admin → requires role: "admin"
 * - /internal → requires role: "internal"
 * - /dashboard, /subscriptions, /invoices, /checkout → requires role: "portal"
 * - /login, /signup → redirects authenticated users to their home
 */

import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import {
  getDefaultPortalPath,
  normalizeUserRole,
  type UserRole,
} from "@/lib/roles"

const SESSION_COOKIE = "sms.session"

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET is not set")
  return new TextEncoder().encode(secret)
}

interface TokenPayload {
  id: string
  email: string
  name: string
  role: string
  image: string | null
}

/**
 * Attempts to decode the session JWT from the request cookie.
 * Returns null if missing, invalid, or expired — never throws.
 */
async function getSessionFromRequest(
  request: NextRequest
): Promise<{ user: { id: string; role: UserRole } } | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify<TokenPayload>(token, getSecret(), {
      algorithms: ["HS256"],
    })

    if (!payload.id || !payload.email) return null

    return {
      user: {
        id: payload.id,
        role: normalizeUserRole(payload.role),
      },
    }
  } catch {
    return null
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await getSessionFromRequest(request)
  const isLoggedIn = session !== null
  const userRole = session?.user.role ?? null

  const redirectToRoleHome = () =>
    NextResponse.redirect(
      new URL(getDefaultPortalPath(userRole), request.nextUrl)
    )

  const redirectToLogin = () => {
    const loginUrl = new URL("/login", request.nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Admin routes ────────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) return redirectToLogin()
    if (userRole !== "admin") return redirectToRoleHome()
    return NextResponse.next()
  }

  // ── Internal routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/internal")) {
    if (!isLoggedIn) return redirectToLogin()
    if (userRole !== "internal") return redirectToRoleHome()
    return NextResponse.next()
  }

  // ── Portal routes (portal role only) ────────────────────────────────────────
  const portalRoutes = ["/dashboard", "/subscriptions", "/invoices", "/checkout", "/cart"]
  if (portalRoutes.some((r) => pathname.startsWith(r))) {
    if (!isLoggedIn) return redirectToLogin()
    if (userRole !== "portal") return redirectToRoleHome()
    return NextResponse.next()
  }

  // ── Auth-redirect helper ─────────────────────────────────────────────────────
  if (pathname.startsWith("/auth/redirect")) {
    if (!isLoggedIn) return redirectToLogin()
    return NextResponse.next()
  }

  // ── Profile ─────────────────────────────────────────────────────────────────
  if (pathname.startsWith("/profile")) {
    if (!isLoggedIn) return redirectToLogin()
    return NextResponse.next()
  }

  // ── Auth pages — redirect authenticated users ────────────────────────────────
  if (
    isLoggedIn &&
    (pathname.startsWith("/login") || pathname.startsWith("/signup"))
  ) {
    return redirectToRoleHome()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
