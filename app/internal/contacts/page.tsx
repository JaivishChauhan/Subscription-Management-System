import type { Metadata } from "next"
import Link from "next/link"
import { IconUsers, IconArrowRight, IconSearch } from "@tabler/icons-react"
import { prisma } from "@/lib/db"
import { requireInternalPage } from "@/lib/admin"

export const metadata: Metadata = {
  title: "Contacts | Internal",
}

export const dynamic = "force-dynamic"

type ContactsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Internal Contacts page — read-only view of all CRM contacts.
 * @security Requires internal role. Internal users cannot create/delete contacts.
 */
export default async function InternalContactsPage({ searchParams }: ContactsPageProps) {
  await requireInternalPage()

  const rawParams = await searchParams
  const q = firstValue(rawParams.q)
  const page = Math.max(1, parseInt(firstValue(rawParams.page) ?? "1", 10))
  const pageSize = 20

  const where = q
    ? {
        OR: [
          { firstName: { contains: q, mode: "insensitive" as const } },
          { lastName: { contains: q, mode: "insensitive" as const } },
          { company: { contains: q, mode: "insensitive" as const } },
          { user: { email: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : {}

  const [total, contacts] = await prisma.$transaction([
    prisma.contact.count({ where }),
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { email: true, role: true } },
        _count: { select: { subscriptions: true } },
      },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-card via-card to-sky-500/5 p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.28em] text-sky-600 uppercase">CRM</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Contacts</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          View all registered customers and contacts. Use this to look up accounts, companies, and subscription counts.
        </p>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <form className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Search contacts</span>
            <IconSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by name, company, or email"
              className="w-full rounded-2xl border border-input bg-background py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
          </label>
          <button
            type="submit"
            className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold hover:bg-muted"
          >
            Search
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-3xl border border-border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Company</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Subscriptions</th>
                <th className="px-5 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                      <IconUsers className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold">No contacts found</h2>
                  </td>
                </tr>
              ) : (
                contacts.map((c) => {
                  const fullName = [c.firstName, c.lastName].filter(Boolean).join(" ") || "—"
                  return (
                    <tr key={c.id} className="hover:bg-muted/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-bold dark:bg-sky-900/30 dark:text-sky-400">
                            {(c.firstName || "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{c.company ?? "—"}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{c.user?.email ?? "—"}</td>
                      <td className="px-5 py-4 text-sm">{c._count.subscriptions}</td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/contacts/${c.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-500"
                        >
                          View
                          <IconArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {total} contact{total === 1 ? "" : "s"} total
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={buildHref(rawParams, page - 1)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            {page < totalPages && (
              <Link
                href={buildHref(rawParams, page + 1)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function firstValue(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

function buildHref(params: Record<string, string | string[] | undefined>, nextPage: number) {
  const p = new URLSearchParams()
  const q = firstValue(params.q)
  if (q) p.set("q", q)
  p.set("page", String(nextPage))
  return `/internal/contacts?${p.toString()}`
}
