"use client"

import { useSession } from "@/hooks/use-session"
import Link from "next/link"

/**
 * Debug page — shows current session data (dev only).
 * Uses our custom useSession hook, not next-auth/react.
 */
export default function DebugSessionPage() {
  const { session, status } = useSession()

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Session Debug</h1>

        <div className="space-y-4">
          <div className="border-border bg-card rounded-lg border p-6">
            <h2 className="mb-2 text-xl font-semibold">Status</h2>
            <p className="font-mono text-sm">
              {status === "loading" && "Loading..."}
              {status === "authenticated" && "✅ Authenticated"}
              {status === "unauthenticated" && "❌ Not Authenticated"}
            </p>
          </div>

          <div className="border-border bg-card rounded-lg border p-6">
            <h2 className="mb-2 text-xl font-semibold">Session Data</h2>
            <pre className="bg-muted overflow-auto rounded p-4 text-xs">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div className="border-border bg-card rounded-lg border p-6">
            <h2 className="mb-2 text-xl font-semibold">Auth Cookie</h2>
            <p className="text-muted-foreground font-mono text-xs">
              sms.session cookie is httpOnly — not visible to JS (this is
              correct).
            </p>
          </div>

          <div className="flex gap-4">
            <Link
              href="/"
              className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Go Home
            </Link>
            <Link
              href="/login"
              className="border-border bg-card hover:bg-muted rounded-full border px-6 py-2 text-sm font-semibold"
            >
              Go to Login
            </Link>
            <Link
              href="/dashboard"
              className="border-border bg-card hover:bg-muted rounded-full border px-6 py-2 text-sm font-semibold"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
