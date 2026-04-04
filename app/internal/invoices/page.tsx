import type { Metadata } from "next"
import Link from "next/link"
import {
  IconArrowRight,
  IconFileInvoice,
  IconSearch,
} from "@tabler/icons-react"
import { prisma } from "@/lib/db"
import { requireInternalPage } from "@/lib/admin"
import { invoiceFiltersSchema, type InvoiceStatus } from "@/lib/validations/invoice"
import { InvoiceStatusBadge } from "@/app/admin/invoices/_components/InvoiceStatusBadge"

export const metadata: Metadata = {
  title: "Invoices",
}

export const dynamic = "force-dynamic"

type InvoicesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const STATUS_TABS: Array<{ label: string; value: "all" | InvoiceStatus }> = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
]

export default async function InternalInvoicesPage({ searchParams }: InvoicesPageProps) {
  await requireInternalPage()

  const rawSearchParams = await searchParams
  const parsed = invoiceFiltersSchema.parse({
    q: firstValue(rawSearchParams.q),
    status: firstValue(rawSearchParams.status),
    page: firstValue(rawSearchParams.page),
    pageSize: firstValue(rawSearchParams.pageSize),
  })

  const { q, status, page, pageSize } = parsed
  const where = buildInvoiceWhereClause({ q, status })

  const [invoices, totalInvoices, draftCount, confirmedCount, paidCount, cancelledCount] =
    await prisma.$transaction([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          contact: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
      prisma.invoice.count({ where: { status: "draft" } }),
      prisma.invoice.count({ where: { status: "confirmed" } }),
      prisma.invoice.count({ where: { status: "paid" } }),
      prisma.invoice.count({ where: { status: "cancelled" } }),
    ])

  const totalPages = Math.max(1, Math.ceil(totalInvoices / pageSize))
  const statusCounts: Record<string, number> = {
    all: draftCount + confirmedCount + paidCount + cancelledCount,
    draft: draftCount,
    confirmed: confirmedCount,
    paid: paidCount,
    cancelled: cancelledCount,
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-white via-sky-50/70 to-cyan-50/80 p-6 shadow-sm dark:from-card dark:via-card dark:to-card">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.28em] text-sky-600 uppercase">
            Internal Invoices
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Billing operations queue</h1>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Internal users can monitor invoice progression, overdue balances, and customer billing
            records from a dedicated operational portal.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={buildStatusHref(rawSearchParams, tab.value)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                status === tab.value
                  ? "bg-sky-600 text-white"
                  : "border border-border bg-card hover:bg-muted"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  status === tab.value ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {statusCounts[tab.value]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <form className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <span className="sr-only">Search invoices</span>
            <IconSearch className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by invoice number, customer, company, or email"
              className="w-full rounded-2xl border border-input bg-background py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
          </label>

          <button
            type="submit"
            className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Apply search
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-3xl border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  <th className="px-5 py-4">Invoice</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Due Date</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <IconFileInvoice className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">No invoices found</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Activate a subscription to generate the first invoice record.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => {
                    const customerName =
                      [invoice.contact.firstName, invoice.contact.lastName]
                        .filter(Boolean)
                        .join(" ")
                        .trim() ||
                      invoice.contact.company ||
                      "Customer"
                    const isOverdue =
                      invoice.status === "confirmed" &&
                      invoice.dueDate &&
                      new Date(invoice.dueDate) < new Date()

                    return (
                      <tr key={invoice.id} className={isOverdue ? "bg-red-50/40 dark:bg-red-500/5" : "hover:bg-muted/20"}>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold">{invoice.invoiceNumber}</p>
                            <p className="text-muted-foreground text-sm">
                              Created {formatDate(invoice.createdAt)}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium">{customerName}</p>
                            <p className="text-muted-foreground text-sm">
                              {invoice.contact.user.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium">
                          {formatCurrency(invoice.total)}
                        </td>
                        <td className="px-5 py-4">
                          <InvoiceStatusBadge status={normalizeInvoiceStatus(invoice.status)} />
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <span className={isOverdue ? "font-semibold text-red-600" : "text-muted-foreground"}>
                            {invoice.dueDate ? formatDate(invoice.dueDate) : "Not set"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/internal/invoices/${invoice.id}`}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 transition-colors hover:text-sky-500"
                          >
                            Open
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
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + (invoices.length ? 1 : 0)}-
            {(page - 1) * pageSize + invoices.length} of {totalInvoices} invoice
            {totalInvoices === 1 ? "" : "s"}.
          </p>

          <div className="flex items-center gap-2">
            <PaginationLink
              href={buildPageHref(rawSearchParams, Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Previous
            </PaginationLink>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <PaginationLink
              href={buildPageHref(rawSearchParams, Math.min(totalPages, page + 1))}
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
      <span className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground/60">
        {children}
      </span>
    )
  }

  return (
    <Link
      href={href}
      className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
    >
      {children}
    </Link>
  )
}

function buildInvoiceWhereClause({
  q,
  status,
}: {
  q?: string
  status: "all" | InvoiceStatus
}) {
  return {
    ...(status === "all" ? {} : { status }),
    ...(q
      ? {
          OR: [
            { invoiceNumber: { contains: q, mode: "insensitive" as const } },
            { contact: { firstName: { contains: q, mode: "insensitive" as const } } },
            { contact: { lastName: { contains: q, mode: "insensitive" as const } } },
            { contact: { company: { contains: q, mode: "insensitive" as const } } },
            { contact: { user: { email: { contains: q, mode: "insensitive" as const } } } },
          ],
        }
      : {}),
  }
}

function buildStatusHref(
  searchParams: Record<string, string | string[] | undefined>,
  nextStatus: "all" | InvoiceStatus,
) {
  const params = new URLSearchParams()
  const q = firstValue(searchParams.q)
  const pageSize = firstValue(searchParams.pageSize)

  if (q) {
    params.set("q", q)
  }

  if (pageSize) {
    params.set("pageSize", pageSize)
  }

  params.set("status", nextStatus)

  return `/internal/invoices?${params.toString()}`
}

function buildPageHref(
  searchParams: Record<string, string | string[] | undefined>,
  nextPage: number,
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

  return `/internal/invoices?${params.toString()}`
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function normalizeInvoiceStatus(value: string): InvoiceStatus {
  switch (value) {
    case "confirmed":
    case "paid":
    case "cancelled":
      return value
    default:
      return "draft"
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(value)
}
