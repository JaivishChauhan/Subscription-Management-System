/**
 * @fileoverview Hand-rolled JWT authentication for Next.js App Router.
 *
 * Architecture:
 * - JWTs are signed with HS256 using AUTH_SECRET (via jose).
 * - Sessions are stored in an httpOnly cookie — never accessible to JS.
 * - The `auth()` function is safe to call in ANY context: server components,
 *   route handlers, server actions, and middleware. No Edge/Node split.
 *
 * @security Passwords are hashed with bcryptjs (cost 12). JWTs are signed and
 * verified server-side only. Cookie is httpOnly + SameSite=lax.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { compare, hash } from "bcryptjs"
import { normalizeUserRole, type UserRole } from "@/lib/roles"

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_COOKIE = "sms.session"
const SESSION_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds
const BCRYPT_COST = 12

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error("AUTH_SECRET environment variable is not set.")
  return new TextEncoder().encode(secret)
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
  image: string | null
}

export interface Session {
  user: SessionUser
  expires: string // ISO string
}

interface SessionJWTPayload extends JWTPayload {
  id: string
  email: string
  name: string
  role: string
  image: string | null
}

// ─── Token Operations ─────────────────────────────────────────────────────────

/**
 * Signs a JWT containing the user's session data.
 * Expires in 30 days.
 */
async function signSessionToken(user: SessionUser): Promise<string> {
  const payload: SessionJWTPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image,
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .setJti(crypto.randomUUID())
    .sign(getSecret())
}

/**
 * Verifies a JWT and returns the decoded payload.
 * Returns null if the token is invalid, expired, or tampered with.
 */
async function verifySessionToken(
  token: string
): Promise<SessionJWTPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionJWTPayload>(
      token,
      getSecret(),
      { algorithms: ["HS256"] }
    )
    return payload
  } catch {
    return null
  }
}

// ─── Core Session API ─────────────────────────────────────────────────────────

/**
 * Reads and validates the session cookie.
 * Returns the Session object or null if unauthenticated.
 *
 * @security This is the ONLY way to read a session server-side.
 * Never trust client-supplied data for auth checks.
 */
export async function auth(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) return null

  const payload = await verifySessionToken(token)
  if (!payload || !payload.id || !payload.email) return null

  const expiresAt = payload.exp ? new Date(payload.exp * 1000) : new Date(Date.now() + SESSION_MAX_AGE * 1000)

  return {
    user: {
      id: payload.id,
      email: payload.email,
      name: payload.name ?? "",
      role: normalizeUserRole(payload.role),
      image: payload.image ?? null,
    },
    expires: expiresAt.toISOString(),
  }
}

/**
 * Reads the raw JWT string from the cookie for Edge/middleware use.
 * Does NOT call `cookies()` (which requires Node.js headers API).
 * Call this from middleware by passing the cookie value directly.
 */
export async function verifyTokenFromString(
  token: string
): Promise<Session | null> {
  const payload = await verifySessionToken(token)
  if (!payload || !payload.id || !payload.email) return null

  const expiresAt = payload.exp
    ? new Date(payload.exp * 1000)
    : new Date(Date.now() + SESSION_MAX_AGE * 1000)

  return {
    user: {
      id: payload.id,
      email: payload.email,
      name: payload.name ?? "",
      role: normalizeUserRole(payload.role),
      image: payload.image ?? null,
    },
    expires: expiresAt.toISOString(),
  }
}

/**
 * Creates a session for the user and sets the httpOnly session cookie.
 * Call this after successful credential or OAuth verification.
 *
 * @security Cookie is httpOnly, SameSite=lax, Secure in production.
 */
export async function createSession(user: SessionUser): Promise<void> {
  const token = await signSessionToken(user)
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

/**
 * Destroys the session by clearing the session cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

// ─── Auth Operations ──────────────────────────────────────────────────────────

/**
 * Authenticates a user by email + password.
 * Fetches the user from the DB, verifies bcrypt hash, and creates a session.
 *
 * @returns The authenticated session or an error message string.
 */
export async function signInWithCredentials(
  email: string,
  password: string
): Promise<{ session: Session; error: null } | { session: null; error: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        password: true,
      },
    })

    if (!user || !user.password) {
      return { session: null, error: "Invalid email or password." }
    }

    // Support legacy plain-text passwords (dev bootstrap) — upgrade on login
    let isValid = await compare(password, user.password)

    if (!isValid && user.password === password) {
      // Legacy plain-text match — upgrade to bcrypt silently
      const hashedPassword = await hash(password, BCRYPT_COST)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })
      isValid = true
    }

    if (!isValid) {
      return { session: null, error: "Invalid email or password." }
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name ?? "",
      role: normalizeUserRole(user.role),
      image: user.image ?? null,
    }

    await createSession(sessionUser)

    return {
      session: {
        user: sessionUser,
        expires: new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString(),
      },
      error: null,
    }
  } catch (error) {
    console.error("[auth] signInWithCredentials error:", error)
    return { session: null, error: "Authentication service error. Please try again." }
  }
}

/**
 * Signs in or creates a user via Google OAuth.
 * If the user doesn't exist, creates a new `portal` role user + Contact.
 *
 * @returns The authenticated session or an error string.
 */
export async function signInWithGoogle(googleUser: {
  id: string
  email: string
  name: string
  image: string | null
}): Promise<{ session: Session; error: null } | { session: null; error: string }> {
  try {
    let dbUser = await prisma.user.findUnique({
      where: { email: googleUser.email },
      select: { id: true, email: true, name: true, role: true, image: true },
    })

    if (!dbUser) {
      const nameParts = (googleUser.name ?? "").trim().split(/\s+/)
      dbUser = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name ?? "",
          image: googleUser.image,
          role: "portal",
          password: await hash(crypto.randomUUID(), BCRYPT_COST), // unusable random password
          emailVerified: new Date(),
        },
        select: { id: true, email: true, name: true, role: true, image: true },
      })

      await prisma.contact.create({
        data: {
          userId: dbUser.id,
          firstName: nameParts[0] ?? "",
          lastName: nameParts.slice(1).join(" ") ?? "",
        },
      })
    }

    const sessionUser: SessionUser = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name ?? "",
      role: normalizeUserRole(dbUser.role),
      image: dbUser.image ?? null,
    }

    await createSession(sessionUser)

    return {
      session: {
        user: sessionUser,
        expires: new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString(),
      },
      error: null,
    }
  } catch (error) {
    console.error("[auth] signInWithGoogle error:", error)
    return { session: null, error: "Google sign-in failed. Please try again." }
  }
}

/**
 * Signs the user out by destroying the session cookie.
 */
export async function signOut(): Promise<void> {
  await destroySession()
}

// ─── Cookie name export for middleware ───────────────────────────────────────
export { SESSION_COOKIE }
