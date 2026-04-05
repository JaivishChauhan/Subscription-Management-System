import { NextRequest, NextResponse } from "next/server"
import { signInWithGoogle } from "@/lib/auth"
import { getDefaultPortalPath } from "@/lib/roles"
import { jwtDecode } from "jwt-decode"

export async function GET(request: NextRequest) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Missing Google OAuth credentials" },
      { status: 500 }
    )
  }

  const url = new URL(request.url)
  const protocol = request.headers.get("x-forwarded-proto") || "http"
  const host = request.headers.get("host") || url.host
  const appUrl = `${protocol}://${host}`
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const error = url.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=OAuthCallbackError`)
  }

  let finalCallbackUrl = "/"
  if (state) {
    try {
      const decodedState = JSON.parse(
        Buffer.from(state, "base64url").toString("utf-8")
      )
      if (decodedState.callbackUrl) {
        finalCallbackUrl = decodedState.callbackUrl
      }
    } catch {
      // ignore
    }
  }

  const redirectUri = `${appUrl}/api/auth/google/callback`

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok || !tokenData.id_token) {
      console.error("[Google OAuth] Token exchange failed:", tokenData)
      return NextResponse.redirect(`${appUrl}/login?error=OAuthExchangeError`)
    }

    // Decode the Google ID token to get the user's profile
    // (We don't strictly verify the signature here because it just came from a secure back-channel HTTPS request)
    const decodedToken = jwtDecode<{
      sub: string
      email: string
      name?: string
      picture?: string
    }>(tokenData.id_token)

    if (!decodedToken.email || !decodedToken.sub) {
      return NextResponse.redirect(`${appUrl}/login?error=OAuthProfileMissing`)
    }

    // Pass to our internal logic to upsert user and create session cookie
    const result = await signInWithGoogle({
      id: decodedToken.sub,
      email: decodedToken.email,
      name: decodedToken.name ?? "",
      image: decodedToken.picture ?? null,
    })

    if (result.error || !result.session) {
      return NextResponse.redirect(
        `${appUrl}/login?error=AccountActionRequired`
      )
    }

    // Determine correct dashboard redirect if a default callback wasn't given
    if (finalCallbackUrl === "/" || finalCallbackUrl === "/auth/redirect") {
      finalCallbackUrl = getDefaultPortalPath(result.session.user.role)
    }

    // We successfully signed in — redirect to the app!
    return NextResponse.redirect(`${appUrl}${finalCallbackUrl}`)
  } catch (err) {
    console.error("[Google OAuth] Server error:", err)
    return NextResponse.redirect(`${appUrl}/login?error=InternalError`)
  }
}
