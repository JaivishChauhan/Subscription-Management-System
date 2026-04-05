import { NextResponse } from "next/server"

/**
 * POST /api/auth/register — No longer needed with Google OAuth.
 * This endpoint is deprecated. Users should sign in with Google.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Registration is handled via Google OAuth. Please use the sign-in button.",
    },
    { status: 410 }
  )
}
