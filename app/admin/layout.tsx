import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDefaultPortalPath } from "@/lib/roles"
import { AdminNavigation } from "./_components/admin-navigation"

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
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar & Mobile Nav */}
      <AdminNavigation
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
