import Link from "next/link"
import { TablePagination } from "@/components/ui/table-pagination"
import { prisma } from "@/lib/db"
import { IconPlus, IconEdit, IconSearch } from "@tabler/icons-react"
import { requireAdminPage } from "@/lib/admin"
import { userFiltersSchema } from "@/lib/validations/user"

export const dynamic = "force-dynamic"

type AdminUsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  await requireAdminPage()

  const rawSearchParams = await searchParams
  const parsed = userFiltersSchema.parse({
    q: firstValue(rawSearchParams.q),
    role: firstValue(rawSearchParams.role),
    page: firstValue(rawSearchParams.page),
    pageSize: firstValue(rawSearchParams.pageSize),
  })

  const { q, role, page, pageSize } = parsed
  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(role === "all" ? {} : { role }),
  }

  const [users, totalUsers, adminCount, internalCount, portalCount] =
    await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({ where: { role: "internal" } }),
      prisma.user.count({ where: { role: "portal" } }),
    ])

  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize))

  return (
    <div className="space-y-8">
      <section className="border-border from-card via-card rounded-[2rem] border bg-gradient-to-br to-indigo-500/5 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
              User Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              System users and access
            </h1>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base">
              Manage system users, administrators, and their access roles.
            </p>
          </div>

          <Link
            href="/admin/users/new"
            className="btn-gradient inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            <IconPlus className="h-4 w-4" />
            New User
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Admin Users" value={adminCount} tone="indigo" />
          <SummaryCard
            label="Internal Users"
            value={internalCount}
            tone="emerald"
          />
          <SummaryCard label="Portal Users" value={portalCount} tone="slate" />
        </div>
      </section>

      <section className="border-border bg-card rounded-[2rem] border p-6 shadow-sm">
        <form className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <span className="sr-only">Search users</span>
            <IconSearch className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by name, email, or phone"
              className="border-input bg-background focus:border-primary focus:ring-primary/20 w-full rounded-2xl border py-3 pr-4 pl-11 text-sm transition-colors outline-none focus:ring-2"
            />
          </label>

          <select
            name="role"
            defaultValue={role}
            className="border-input bg-background focus:border-primary focus:ring-primary/20 rounded-2xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin only</option>
            <option value="internal">Internal only</option>
            <option value="portal">Portal only</option>
          </select>

          <button
            type="submit"
            className="border-border hover:bg-muted rounded-2xl border px-5 py-3 text-sm font-semibold transition-colors"
          >
            Apply filters
          </button>
        </form>

        <div className="border-border mt-6 overflow-hidden rounded-3xl border">
          <div className="overflow-x-auto">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/40">
                <tr className="text-muted-foreground text-left text-xs font-semibold tracking-[0.18em] uppercase">
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <h2 className="mt-4 text-lg font-semibold">
                          No users found
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Try adjusting your filters or create a new user.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/20">
                      <td className="px-5 py-4 font-medium">
                        {user.name || "N/A"}
                      </td>
                      <td className="px-5 py-4">{user.email}</td>
                      <td className="px-5 py-4 capitalize">{user.role}</td>
                      <td className="text-muted-foreground px-5 py-4 text-sm">
                        {user.phone || "N/A"}
                      </td>
                      <td className="text-muted-foreground px-5 py-4 text-sm">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="hover:bg-muted text-muted-foreground hover:text-foreground inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={totalUsers}
          totalPages={totalPages}
        />
      </section>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "indigo" | "slate" | "emerald"
}) {
  const toneClassName = {
    indigo:
      "from-indigo-500/10 to-violet-500/10 text-indigo-700 dark:text-indigo-300",
    slate:
      "from-slate-500/10 to-slate-400/10 text-slate-700 dark:text-slate-300",
    emerald:
      "from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-300",
  }[tone]

  return (
    <div
      className={`border-border rounded-3xl border bg-gradient-to-br p-5 ${toneClassName}`}
    >
      <p className="text-xs font-semibold tracking-[0.2em] uppercase">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  )
}

function buildPageHref(
  searchParams: Record<string, string | string[] | undefined>,
  nextPage: number
) {
  const params = new URLSearchParams()

  const q = firstValue(searchParams.q)
  const role = firstValue(searchParams.role)
  const pageSize = firstValue(searchParams.pageSize)

  if (q) {
    params.set("q", q)
  }

  if (role) {
    params.set("role", role)
  }

  if (pageSize) {
    params.set("pageSize", pageSize)
  }

  params.set("page", String(nextPage))

  return `/admin/users?${params.toString()}`
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(value)
}
