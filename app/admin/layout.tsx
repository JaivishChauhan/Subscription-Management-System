import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDefaultPortalPath } from "@/lib/roles"
import {
  IconLayoutDashboard,
  IconUsers,
  IconPackage,
  IconFileInvoice,
  IconCreditCard,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconRocket,
  IconReceipt2,
  IconRepeat,
  IconApps,
  IconPuzzle,
  IconTag,
  IconShieldLock,
} from "@tabler/icons-react"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: "Admin Portal",
}

/**
 * Admin layout — sidebar navigation + content area.
 * Mobile: hamburger menu (expandable).
 * Desktop: fixed sidebar + scrollable content.
 *
 * @security Only accessible to admin role.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "admin") {
    redirect(getDefaultPortalPath(session.user.role))
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar
        userName={session.user.name ?? "Admin"}
        userRole={session.user.role}
      />

      {/* Main Content */}
      <main className="bg-background flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

/* ============================================================================
   SIDEBAR
   ============================================================================ */

const NAV_ITEMS = [
  { href: "/admin", icon: IconLayoutDashboard, label: "Dashboard" },
  { href: "/admin/services", icon: IconApps, label: "Services" },
  { href: "/admin/bundles", icon: IconPuzzle, label: "Bundles" },
  { href: "/admin/contacts", icon: IconUsers, label: "Contacts" },
  { href: "/admin/products", icon: IconPackage, label: "Products" },
  { href: "/admin/subscriptions", icon: IconRepeat, label: "Subscriptions" },
  { href: "/admin/quotations", icon: IconReceipt2, label: "Quotations" },
  { href: "/admin/invoices", icon: IconFileInvoice, label: "Invoices" },
  { href: "/admin/payments", icon: IconCreditCard, label: "Payments" },
  { href: "/admin/reports", icon: IconChartBar, label: "Reports" },
  // Admin-exclusive modules
  { href: "/admin/users", icon: IconShieldLock, label: "Users" },
  { href: "/admin/discounts", icon: IconTag, label: "Discounts" },
  { href: "/admin/settings", icon: IconSettings, label: "Settings" },
] as const

function AdminSidebar({
  userName,
  userRole,
}: {
  userName: string
  userRole: string
}) {
  return (
    <aside className="border-sidebar-border bg-sidebar hidden w-64 shrink-0 border-r lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="border-sidebar-border flex h-16 items-center gap-2.5 border-b px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md">
            <IconRocket className="h-5 w-5 text-white" stroke={2} />
          </div>
          <div>
            <span className="text-gradient text-base font-bold">SubsMS</span>
            <p className="text-sidebar-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Admin Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
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

        {/* User Info */}
        <div className="border-sidebar-border border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sidebar-foreground truncate text-sm font-semibold">
                {userName}
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
  )
}
