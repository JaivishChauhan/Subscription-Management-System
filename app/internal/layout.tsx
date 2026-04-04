import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDefaultPortalPath } from "@/lib/roles"
import {
  IconLayoutDashboard,
  IconFileInvoice,
  IconLogout,
  IconRepeat,
  IconRocket,
} from "@tabler/icons-react"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "Internal Portal",
}

const NAV_ITEMS = [
  { href: "/internal", icon: IconLayoutDashboard, label: "Dashboard" },
  { href: "/internal/subscriptions", icon: IconRepeat, label: "Subscriptions" },
  { href: "/internal/invoices", icon: IconFileInvoice, label: "Invoices" },
] as const

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const userRole = (session.user as { role?: string }).role
  if (userRole !== "internal") {
    redirect(getDefaultPortalPath(userRole))
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-600 to-cyan-500 shadow-md">
              <IconRocket className="h-5 w-5 text-white" stroke={2} />
            </div>
            <div>
              <span className="text-base font-bold text-foreground">SubsMS</span>
              <p className="text-[10px] font-medium uppercase tracking-wider text-sidebar-muted-foreground">
                Internal Portal
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <item.icon className="h-5 w-5 shrink-0" stroke={1.5} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-xs font-bold text-white">
                {(session.user.name ?? "I").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {session.user.name ?? "Internal User"}
                </p>
                <p className="text-xs capitalize text-sidebar-muted-foreground">
                  {userRole}
                </p>
              </div>
              <ThemeToggle className="shrink-0" />
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="rounded-md p-1.5 text-sidebar-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-destructive"
                  aria-label="Sign out"
                >
                  <IconLogout className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
