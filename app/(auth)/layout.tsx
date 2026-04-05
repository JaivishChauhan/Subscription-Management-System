import { IconRocket } from "@tabler/icons-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

/**
 * Auth layout — shared across login, signup, and reset-password.
 * Split-screen (Mobile: stack, Desktop: side-by-side).
 * Left: Branded feature showcase.
 * Right: Authentication forms.
 *
 * Dark/Light mode fully supported — all colors use CSS design tokens.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background flex min-h-screen flex-col lg:flex-row">
      {/* LEFT: Branding Panel (Hidden on Mobile) */}
      <div className="bg-muted/40 border-border relative hidden w-1/2 flex-col justify-between overflow-hidden border-r px-12 py-16 lg:flex">
        {/* Abstract ambient glow */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
        >
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-400/10 blur-[80px]" />
          <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-indigo-400/10 blur-[100px]" />
        </div>

        <div className="relative z-10 space-y-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
              <IconRocket className="h-5 w-5 text-white" stroke={2} />
            </div>
            <span className="text-foreground text-2xl font-bold">SubsMS</span>
          </Link>

          <div className="mt-16">
            <h1 className="f-syne text-foreground max-w-lg text-5xl leading-[1.1] font-extrabold tracking-tight">
              The simplest way to manage your subscriptions
            </h1>
            <p className="text-muted-foreground mt-4 max-w-md text-base">
              Automate billing, reduce churn, and scale your recurring revenue
              businesses with our intelligent AI-powered platform.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="mt-8 space-y-3">
            {[
              "Auto-generated invoices on subscription activation",
              "Role-based access: Admin, Internal & Portal",
              "Real-time MRR, churn, and revenue analytics",
            ].map((f) => (
              <div
                key={f}
                className="text-muted-foreground flex items-center gap-3 text-sm"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/60">
                  <svg
                    className="h-3 w-3 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Feature UI Mockup */}
        <div className="bg-card border-border relative z-10 mt-12 w-full flex-grow overflow-hidden rounded-tl-2xl rounded-tr-2xl border shadow-2xl">
          {/* Fake Window Header */}
          <div className="border-border bg-muted/50 flex items-center gap-2 border-b px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <span className="f-mono text-muted-foreground ml-2 text-[10px]">
              SubsMS — Dashboard
            </span>
          </div>
          {/* Fake App Data */}
          <div className="space-y-4 p-6">
            <div className="h-6 w-40 rounded bg-indigo-100 dark:bg-indigo-950/50" />
            <div className="grid grid-cols-3 gap-3">
              {[
                "bg-indigo-50 dark:bg-indigo-950/30",
                "bg-violet-50 dark:bg-violet-950/30",
                "bg-emerald-50 dark:bg-emerald-950/30",
              ].map((cls, i) => (
                <div
                  key={i}
                  className={`border-border h-16 rounded-lg border ${cls}`}
                />
              ))}
            </div>
            <div className="border-border bg-muted/30 h-24 w-full rounded-lg border" />
            <div className="flex gap-3">
              <div className="bg-muted/40 border-border h-10 flex-1 rounded border" />
              <div className="bg-muted/40 border-border h-10 flex-1 rounded border" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Auth Card */}
      <div className="relative z-10 flex w-full items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2">
        {/* Theme toggle in top-right */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[420px]">
          {/* Mobile Only Brand (Hidden on Desktop) */}
          <Link
            href="/"
            className="mb-8 flex items-center justify-center gap-2.5 transition-opacity hover:opacity-80 lg:hidden"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
              <IconRocket className="h-5 w-5 text-white" stroke={2} />
            </div>
            <span className="text-foreground text-2xl font-bold">SubsMS</span>
          </Link>

          <div className="border-border bg-card rounded-[1.5rem] border p-8 shadow-[var(--shadow-card)] sm:p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
