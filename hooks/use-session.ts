"use client"

/**
 * @fileoverview Client-side session hook.
 *
 * Fetches the session once from GET /api/auth and caches the result
 * in component state. Much simpler than next-auth/react's useSession —
 * no context provider required.
 *
 * @client This hook must only run in "use client" components.
 */

import { useState, useEffect } from "react"
import type { Session } from "@/lib/auth"

type SessionStatus = "loading" | "authenticated" | "unauthenticated"

interface UseSessionResult {
  session: Session | null
  status: SessionStatus
  refresh: () => void
}

/**
 * Fetches session state from the server via GET /api/auth.
 * Returns loading/authenticated/unauthenticated status plus the session object.
 */
export function useSession(): UseSessionResult {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<SessionStatus>("loading")
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchSession() {
      try {
        const res = await fetch("/api/auth", { credentials: "include" })
        if (!res.ok) throw new Error("Failed to fetch session")
        const data: { session: Session | null } = await res.json()
        if (!cancelled) {
          setSession(data.session)
          setStatus(data.session ? "authenticated" : "unauthenticated")
        }
      } catch {
        if (!cancelled) {
          setSession(null)
          setStatus("unauthenticated")
        }
      }
    }

    fetchSession()
    return () => { cancelled = true }
  }, [tick])

  return {
    session,
    status,
    refresh: () => setTick((t) => t + 1),
  }
}

/**
 * Signs the user out by calling POST /api/auth?action=signout, then reloads.
 */
export async function signOut(options?: { callbackUrl?: string }): Promise<void> {
  await fetch("/api/auth?action=signout", {
    method: "POST",
    credentials: "include",
  })
  window.location.href = options?.callbackUrl ?? "/"
}
