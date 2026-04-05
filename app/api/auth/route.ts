/**
 * @fileoverview Auth API route handlers.
 *
 * POST /api/auth/signin   — credentials sign-in
 * GET  /api/auth/session  — returns current session (for client components)
 * POST /api/auth/google   — exchanges Google ID token for a session
 */

import { NextRequest, NextResponse } from "next/server"
import { auth, signInWithCredentials, signInWithGoogle } from "@/lib/auth"

// ─── POST /api/auth/signin ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const action = url.searchParams.get("action")

  if (action === "google") {
    try {
      const body = await request.json()
      const { email, name, image, googleId } = body

      if (!email || !googleId) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        )
      }

      const result = await signInWithGoogle({
        id: googleId,
        email,
        name,
        image,
      })
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 401 })
      }

      return NextResponse.json({
        ok: true,
        role: result.session!.user.role,
      })
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }
  }

  // Default: credentials sign-in
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      )
    }

    const result = await signInWithCredentials(String(email), String(password))

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    return NextResponse.json({
      ok: true,
      role: result.session!.user.role,
    })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    )
  }
}

// ─── GET /api/auth/session ────────────────────────────────────────────────────
export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ session: null })
  }
  return NextResponse.json({ session })
}
