"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  IconMenu2,
  IconX,
} from "@tabler/icons-react"
import { ThemeToggle } from "@/components/theme-toggle"

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
  { href: "/admin/users", icon: IconShieldLock, label: "Users" },
  { href: "/admin/discounts", icon: IconTag, label: "Discounts" },
  { href: "/admin/settings", icon: IconSettings, label: "Settings" },
] as const

export function AdminNavigation({
  userName,
  userRole,
}: {
  userName: string
  userRole: string
}) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [prevPathname, setPrevPathname] = useState(pathname)

  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="bg-background border-sidebar-border flex h-16 shrink-0 items-center justify-between border-b px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md">
            <IconRocket className="h-4 w-4 text-white" stroke={2} />
          </div>
          <span className="text-gradient text-base font-bold">SubsMS</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-foreground hover:bg-muted rounded-md p-2"
        >
          {isOpen ? <IconX stroke={1.5} /> : <IconMenu2 stroke={1.5} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar (Mobile & Desktop) */}
      <aside
        className={`bg-background border-sidebar-border fixed inset-y-0 left-0 z-50 w-64 shrink-0 transform border-r transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-sidebar-border hidden h-16 items-center gap-2.5 border-b px-5 lg:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md">
              <IconRocket className="h-5 w-5 text-white" stroke={2} />
            </div>
            <div>
              <span className="text-gradient text-base font-bold">SubsMS</span>
              <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                Admin Portal
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname !== "/admin" &&
                  item.href !== "/admin" &&
                  pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" stroke={1.5} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Info */}
          <div className="border-sidebar-border border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-foreground truncate text-sm font-semibold">
                  {userName}
                </p>
                <p className="text-muted-foreground text-xs capitalize">
                  {userRole}
                </p>
              </div>
              <ThemeToggle className="shrink-0" />
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-muted-foreground hover:bg-muted hover:text-destructive rounded-md p-1.5 transition-colors"
                  aria-label="Sign out"
                >
                  <IconLogout className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
