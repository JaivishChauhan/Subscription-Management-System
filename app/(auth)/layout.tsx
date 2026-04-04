import { IconRocket } from "@tabler/icons-react";
import Link from "next/link";

/**
 * Auth layout — shared across login, signup, and reset-password.
 * Centered card on gradient background.
 * Mobile: full-width card with padding.
 * Desktop: max-w-md centered with blur orbs.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
      {/* Background orbs */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-indigo-400/20 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-400/15 blur-[120px]" />
      </div>

      {/* Brand */}
      <Link
        href="/"
        className="mb-8 flex items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg">
          <IconRocket className="h-5 w-5 text-white" stroke={2} />
        </div>
        <span className="text-2xl font-bold text-gradient">SubsMS</span>
      </Link>

      {/* Auth Card */}
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
