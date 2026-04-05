import type { Metadata } from "next"
import Link from "next/link"
import { IconCreditCard, IconArrowRight } from "@tabler/icons-react"
import { prisma } from "@/lib/db"
import { requireInternalPage } from "@/lib/admin"

export const metadata: Metadata = {
  title: "Payments | Internal",
}

export const dynamic = "force-dynamic"

type PaymentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
})

/**
 * Internal Payments page — view all recorded payments with invoice linkage.
 * @security Requires internal role.
 */
export default async function InternalPaymentsPage({
  searchParams,
}: PaymentsPageProps) {
  await requireInternalPage()

  const rawParams = await searchParams
  const q = firstValue(rawParams.q)
  const page = Math.max(1, parseInt(firstValue(rawParams.page) ?? "1", 10))
  const pageSize = 20

  const where = q
    ? {
        OR: [
          {
            invoice: {
              invoiceNumber: { contains: q, mode: "insensitive" as const },
            },
          },
          { paymentMethod: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [total, payments] = await prisma.$transaction([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { paymentDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
          },
        },
        createdBy: {
          select: { name: true },
        },
      },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-8">
      <section className="border-border from-card via-card rounded-[2rem] border bg-gradient-to-br to-sky-500/5 p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.28em] text-sky-600 uppercase">
          Finance
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
          Track all recorded payments and their association with invoices. Use
          this to verify outstanding balances.
        </p>
      </section>

      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="divide-border min-w-full divide-y">
            <thead className="bg-muted/40">
              <tr className="text-muted-foreground text-left text-xs font-semibold tracking-widest uppercase">
                <th className="px-5 py-4">Invoice</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Method</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Recorded By</th>
                <th className="px-5 py-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-border bg-card divide-y">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="bg-muted mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                      <IconCreditCard className="text-muted-foreground h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold">
                      No payments recorded yet
                    </h2>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="px-5 py-4 font-mono text-sm">
                      {p.invoice.invoiceNumber}
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-600">
                      {INR.format(p.amount)}
                    </td>
                    <td className="text-muted-foreground px-5 py-4 text-sm capitalize">
                      {p.paymentMethod.replace(/_/g, " ")}
                    </td>
                    <td className="text-muted-foreground px-5 py-4 text-sm">
                      {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="text-muted-foreground px-5 py-4 text-sm">
                      {p.createdBy?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/internal/invoices/${p.invoice.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-500"
                      >
                        View
                        <IconArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-border flex items-center justify-between gap-3 border-t px-5 py-4">
          <p className="text-muted-foreground text-sm">
            {total} payment{total === 1 ? "" : "s"} total
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={buildHref(rawParams, page - 1)}
                className="border-border hover:bg-muted rounded-full border px-4 py-2 text-sm font-semibold"
              >
                Previous
              </Link>
            )}
            <span className="text-muted-foreground text-sm">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={buildHref(rawParams, page + 1)}
                className="border-border hover:bg-muted rounded-full border px-4 py-2 text-sm font-semibold"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function firstValue(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v
}

function buildHref(
  params: Record<string, string | string[] | undefined>,
  nextPage: number
) {
  const p = new URLSearchParams()
  const q = firstValue(params.q)
  if (q) p.set("q", q)
  p.set("page", String(nextPage))
  return `/internal/payments?${p.toString()}`
}
