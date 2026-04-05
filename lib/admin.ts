/**
 * @fileoverview Server-side auth guards for pages and API routes.
 *
 * Uses the hand-rolled auth() from lib/auth — typed, no casting required.
 *
 * @security All redirect/reject decisions are server-side only.
 */

import { NextResponse } from "next/server"
import { redirect } from "next/navigation"
import { auth, type Session } from "@/lib/auth"
import { getDefaultPortalPath, type UserRole } from "@/lib/roles"

// ─── Page Guards ──────────────────────────────────────────────────────────────

/**
 * Guards a server component page by role.
 * Redirects to /login if unauthenticated, or to the role home if unauthorized.
 *
 * @returns The authenticated session (never null — will redirect otherwise).
 */
export async function requirePageRole(
  allowedRoles: UserRole[]
): Promise<Session> {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect(getDefaultPortalPath(session.user.role))
  }

  return session
}

/** Guards a page for admin role only. */
export async function requireAdminPage(): Promise<Session> {
  return requirePageRole(["admin"])
}

/** Guards a page for internal role only. */
export async function requireInternalPage(): Promise<Session> {
  return requirePageRole(["internal"])
}

// ─── API Guards ───────────────────────────────────────────────────────────────

/**
 * Guards an API route handler by role.
 * Returns a 401/403 NextResponse if the check fails, or the session if it passes.
 */
export async function requireApiRole(
  allowedRoles: UserRole[]
): Promise<
  { error: NextResponse; session: null } | { error: null; session: Session }
> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    }
  }

  if (!allowedRoles.includes(session.user.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      session: null,
    }
  }

  return { error: null, session }
}

/** Guards an API route for admin role only. */
export async function requireAdminApi() {
  return requireApiRole(["admin"])
}
