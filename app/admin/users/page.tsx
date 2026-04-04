import type { Metadata } from "next"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"
import { AdminUsersClient } from "./_components/AdminUsersClient"

export const metadata: Metadata = {
  title: "User Management | Admin",
  description: "Create and manage internal and portal users",
}

export const dynamic = "force-dynamic"

/**
 * Admin User Management page — server component that loads the initial user list.
 * @security Requires admin role via requireAdminPage().
 */
export default async function AdminUsersPage() {
  await requireAdminPage()

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where: { role: { in: ["internal", "portal"] } } }),
    prisma.user.findMany({
      where: { role: { in: ["internal", "portal"] } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ])

  // Safe DTO — no passwords or sensitive auth fields leak to client
  const safeUsers = users.map((u) => ({
    ...u,
    role: u.role as "internal" | "portal",
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }))

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-card via-card to-indigo-500/5 p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
          User Management
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Internal &amp; Portal Users</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Create and manage internal operational users and portal customer accounts.
          Only admins can create internal users or change user roles.
        </p>
      </section>

      <AdminUsersClient initialUsers={safeUsers} initialTotal={total} />
    </div>
  )
}
