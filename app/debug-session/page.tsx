"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DebugSessionPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Session Debug</h1>
        
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-2 text-xl font-semibold">Status</h2>
            <p className="font-mono text-sm">
              {status === "loading" && "Loading..."}
              {status === "authenticated" && "✅ Authenticated"}
              {status === "unauthenticated" && "❌ Not Authenticated"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-2 text-xl font-semibold">Session Data</h2>
            <pre className="overflow-auto rounded bg-muted p-4 text-xs">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-2 text-xl font-semibold">Cookies</h2>
            <pre className="overflow-auto rounded bg-muted p-4 text-xs">
              {typeof document !== "undefined" ? document.cookie : "N/A"}
            </pre>
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
              className="rounded-full border border-border bg-card px-6 py-2 text-sm font-semibold hover:bg-muted"
            >
              Go to Login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-border bg-card px-6 py-2 text-sm font-semibold hover:bg-muted"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
