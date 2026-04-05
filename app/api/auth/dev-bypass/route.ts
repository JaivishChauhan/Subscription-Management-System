import { NextRequest, NextResponse } from "next/server"
import { signInWithGoogle } from "@/lib/auth"
import { getDefaultPortalPath } from "@/lib/roles"

export async function GET(request: NextRequest) {
  // STRICT SECURITY CHECK: Only allow in development mode!
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Developer bypass is strictly forbidden in production." },
      { status: 403 }
    )
  }

  // Get the dynamic host so network devices are supported smoothly
  const protocol = request.headers.get("x-forwarded-proto") || "http"
  const host = request.headers.get("host") || new URL(request.url).host
  const appUrl = `${protocol}://${host}`

  // Log in as the primary admin using your Gmail from the .env
  const devEmail = process.env.GMAIL_USER || "admin@example.com"

  try {
    const result = await signInWithGoogle({
      id: "DEV-BYPASS-MOCK-ID",
      email: devEmail,
      name: "Jaivish Chauhan (Dev Bypass)",
      image: null,
    })

    if (result.error || !result.session) {
      return NextResponse.redirect(
        `${appUrl}/login?error=DeveloperBypassFailed`
      )
    }

    const finalPath = getDefaultPortalPath(result.session.user.role)

    // Redirect straight to dashboard, skipping Google OAuth completely
    return NextResponse.redirect(`${appUrl}${finalPath}`)
  } catch (err) {
    console.error("[Dev Bypass] Error:", err)
    return NextResponse.redirect(`${appUrl}/login?error=InternalError`)
  }
}
