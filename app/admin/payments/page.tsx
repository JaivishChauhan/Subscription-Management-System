import type { Metadata } from "next"
import Link from "next/link"
import { IconCreditCard, IconArrowRight, IconPlus } from "@tabler/icons-react"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"
import { paymentFiltersSchema } from "@/lib/validations/payment"
import { TablePagination } from "@/components/ui/table-pagination"

export const metadata: Metadata = {
  title: "Payments",
}

export const dynamic = "force-dynamic"

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdminPage()

  const rawSearchParams = await searchParams
  const firstValue = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v

  const parsed = paymentFiltersSchema.parse({
    page: firstValue(rawSearchParams.page),
    pageSize: firstValue(rawSearchParams.pageSize),
  })

  const { page, pageSize } = parsed

  const payments = await prisma.payment.findMany({
    orderBy: { paymentDate: "desc" },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  const totalPayments = await prisma.payment.count()
  const totalPages = Math.max(1, Math.ceil(totalPayments / pageSize))

  return (
    <div className="space-y-8">
      <section className="border-border from-card via-card rounded-[2rem] border bg-gradient-to-br to-indigo-500/5 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
              Payments
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Settlement audit trail
            </h1>
          </div>
          <Link
            href="/admin/payments/new"
            className="inline-flex max-w-fit items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <IconPlus className="h-4 w-4" />
            Record Payment
          </Link>
        </div>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
          Admin users can review recorded invoice settlements and their
          operational provenance.
        </p>
      </section>

      <section className="border-border bg-card rounded-[2rem] border p-6 shadow-sm">
        <div className="border-border overflow-hidden rounded-3xl border">
          <div className="overflow-x-auto">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/40">
                <tr className="text-muted-foreground text-left text-xs font-semibold tracking-[0.18em] uppercase">
                  <th className="px-5 py-4">Invoice</th>
                  <th className="px-5 py-4">Method</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Recorded By</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/20">
                    <td className="px-5 py-4 font-semibold">
                      {payment.invoice.invoiceNumber}
                    </td>
                    <td className="text-muted-foreground px-5 py-4 text-sm capitalize">
                      {payment.paymentMethod.replaceAll("_", " ")}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium">{payment.createdBy.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {payment.createdBy.email}
                        </p>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-5 py-4 text-sm">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/payments/${payment.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
                      >
                        Edit
                        <IconArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="bg-muted mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                          <IconCreditCard className="text-muted-foreground h-6 w-6" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">
                          No payments found
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Payment records will appear here as invoices are
                          settled.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={totalPayments}
          totalPages={totalPages}
        />
      </section>
    </div>
  )
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
    timeStyle: "short",
  }).format(value)
}
