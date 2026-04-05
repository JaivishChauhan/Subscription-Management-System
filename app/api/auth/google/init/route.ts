import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/auth/google/init
 * Redirects the user to the Google OAuth consent screen.
 */
export async function GET(request: NextRequest) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: "Missing Google OAuth credentials" },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const protocol = request.headers.get("x-forwarded-proto") || "http"
  const host = request.headers.get("host") || new URL(request.url).host
  const appUrl = `${protocol}://${host}`
  const callbackUrl = searchParams.get("callbackUrl") ?? "/"

  // We pass the callbackUrl in the state so we know where to send them after login
  const state = Buffer.from(JSON.stringify({ callbackUrl })).toString(
    "base64url"
  )

  const redirectUri = `${appUrl}/api/auth/callback/google`

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    state: state,
    prompt: "select_account",
  })

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  return NextResponse.redirect(googleAuthUrl)
}
