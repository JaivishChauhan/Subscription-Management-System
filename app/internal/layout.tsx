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
  IconPackage,
  IconCalendar,
  IconUsers,
  IconCreditCard,
  IconChartBar,
} from "@tabler/icons-react"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "Internal Portal",
}

const NAV_ITEMS = [
  { href: "/internal", icon: IconLayoutDashboard, label: "Dashboard" },
  { href: "/internal/contacts", icon: IconUsers, label: "Contacts" },
  { href: "/internal/products", icon: IconPackage, label: "Products" },
  { href: "/internal/plans", icon: IconCalendar, label: "Plans" },
  { href: "/internal/subscriptions", icon: IconRepeat, label: "Subscriptions" },
  { href: "/internal/invoices", icon: IconFileInvoice, label: "Invoices" },
  { href: "/internal/payments", icon: IconCreditCard, label: "Payments" },
  { href: "/internal/reports", icon: IconChartBar, label: "Reports" },
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
      <aside className="border-sidebar-border bg-sidebar hidden w-64 shrink-0 border-r lg:block">
        <div className="flex h-full flex-col">
          <div className="border-sidebar-border flex h-16 items-center gap-2.5 border-b px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-600 to-cyan-500 shadow-md">
              <IconRocket className="h-5 w-5 text-white" stroke={2} />
            </div>
            <div>
              <span className="text-foreground text-base font-bold">
                SubsMS
              </span>
              <p className="text-sidebar-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Internal Portal
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
              >
                <item.icon className="h-5 w-5 shrink-0" stroke={1.5} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-sidebar-border border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-xs font-bold text-white">
                {(session.user.name ?? "I").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sidebar-foreground truncate text-sm font-semibold">
                  {session.user.name ?? "Internal User"}
                </p>
                <p className="text-sidebar-muted-foreground text-xs capitalize">
                  {userRole}
                </p>
              </div>
              <ThemeToggle className="shrink-0" />
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-sidebar-muted-foreground hover:bg-sidebar-accent hover:text-destructive rounded-md p-1.5 transition-colors"
                  aria-label="Sign out"
                >
                  <IconLogout className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <main className="bg-background flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
