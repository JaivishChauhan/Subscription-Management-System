import type { Metadata } from "next"
import Link from "next/link"
import {
  IconArrowRight,
  IconPlus,
  IconReceiptTax,
  IconSearch,
} from "@tabler/icons-react"
import { prisma } from "@/lib/db"
import { requireAdminPage } from "@/lib/admin"
import { taxFiltersSchema } from "@/lib/validations/tax"
import { TaxStatusToggle } from "./_components/TaxStatusToggle"

export const metadata: Metadata = {
  title: "Taxes",
}

export const dynamic = "force-dynamic"

type TaxesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TaxesPage({ searchParams }: TaxesPageProps) {
  await requireAdminPage()

  const rawSearchParams = await searchParams
  const parsed = taxFiltersSchema.parse({
    q: firstValue(rawSearchParams.q),
    status: firstValue(rawSearchParams.status),
    page: firstValue(rawSearchParams.page),
    pageSize: firstValue(rawSearchParams.pageSize),
  })

  const { q, status, page, pageSize } = parsed
  const where = {
    ...(q
      ? {
          name: {
            contains: q,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(status === "all" ? {} : { isActive: status === "active" }),
  }

  const [taxes, totalTaxes, activeCount, inactiveCount] =
    await prisma.$transaction([
      prisma.tax.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          type: true,
          rate: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.tax.count({ where }),
      prisma.tax.count({ where: { isActive: true } }),
      prisma.tax.count({ where: { isActive: false } }),
    ])

  const totalPages = Math.max(1, Math.ceil(totalTaxes / pageSize))

  return (
    <div className="space-y-8">
      <section className="border-border from-card via-card rounded-[2rem] border bg-gradient-to-br to-indigo-500/5 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
              Tax Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Billing rule catalog
            </h1>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base">
              Taxes configured here become the reusable source of truth for
              invoice generation, line-level tax calculations, and later
              checkout alignment work.
            </p>
          </div>

          <Link
            href="/admin/taxes/new"
            className="btn-gradient inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            <IconPlus className="h-4 w-4" />
            New Tax
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Active Taxes" value={activeCount} tone="indigo" />
          <SummaryCard
            label="Inactive Taxes"
            value={inactiveCount}
            tone="slate"
          />
          <SummaryCard
            label="Filtered Results"
            value={totalTaxes}
            tone="emerald"
          />
        </div>
      </section>

      <section className="border-border bg-card rounded-[2rem] border p-6 shadow-sm">
        <form className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <span className="sr-only">Search taxes</span>
            <IconSearch className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by tax name"
              className="border-input bg-background focus:border-primary focus:ring-primary/20 w-full rounded-2xl border py-3 pr-4 pl-11 text-sm transition-colors outline-none focus:ring-2"
            />
          </label>

          <select
            name="status"
            defaultValue={status}
            className="border-input bg-background focus:border-primary focus:ring-primary/20 rounded-2xl border px-4 py-3 text-sm transition-colors outline-none focus:ring-2"
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
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
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Rate</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {taxes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="bg-muted mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                          <IconReceiptTax className="text-muted-foreground h-6 w-6" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">
                          No tax rules found
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Create your first tax rule so invoice generation can
                          stop relying on hardcoded assumptions.
                        </p>
                        <Link
                          href="/admin/taxes/new"
                          className="btn-gradient mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                        >
                          <IconPlus className="h-4 w-4" />
                          Create Tax
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  taxes.map((tax) => (
                    <tr key={tax.id} className="hover:bg-muted/20">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold">{tax.name}</p>
                          <p className="text-muted-foreground text-sm">
                            ID: {tax.id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </td>
                      <td className="text-muted-foreground px-5 py-4 text-sm capitalize">
                        {tax.type}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium">
                        {formatTaxRate(tax.type, tax.rate)}
                      </td>
                      <td className="px-5 py-4">
                        <TaxStatusToggle
                          taxId={tax.id}
                          isActive={tax.isActive}
                        />
                      </td>
                      <td className="text-muted-foreground px-5 py-4 text-sm">
                        {formatDate(tax.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/taxes/${tax.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
                        >
                          Open
                          <IconArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            Showing {(page - 1) * pageSize + (taxes.length ? 1 : 0)}-
            {(page - 1) * pageSize + taxes.length} of {totalTaxes} tax rule
            {totalTaxes === 1 ? "" : "s"}.
          </p>

          <div className="flex items-center gap-2">
            <PaginationLink
              href={buildPageHref(rawSearchParams, Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Previous
            </PaginationLink>
            <span className="text-muted-foreground text-sm">
              Page {page} of {totalPages}
            </span>
            <PaginationLink
              href={buildPageHref(
                rawSearchParams,
                Math.min(totalPages, page + 1)
              )}
              disabled={page >= totalPages}
            >
              Next
            </PaginationLink>
          </div>
        </div>
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

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string
  disabled: boolean
  children: React.ReactNode
}) {
  if (disabled) {
    return (
      <span className="border-border text-muted-foreground/60 rounded-full border px-4 py-2 text-sm font-semibold">
        {children}
      </span>
    )
  }

  return (
    <Link
      href={href}
      className="border-border hover:bg-muted rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
    >
      {children}
    </Link>
  )
}

function buildPageHref(
  searchParams: Record<string, string | string[] | undefined>,
  nextPage: number
) {
  const params = new URLSearchParams()

  const q = firstValue(searchParams.q)
  const status = firstValue(searchParams.status)
  const pageSize = firstValue(searchParams.pageSize)

  if (q) {
    params.set("q", q)
  }

  if (status) {
    params.set("status", status)
  }

  if (pageSize) {
    params.set("pageSize", pageSize)
  }

  params.set("page", String(nextPage))

  return `/admin/taxes?${params.toString()}`
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(value)
}

function formatTaxRate(type: string, rate: number) {
  if (type === "fixed") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(rate)
  }

  return `${rate}%`
}
