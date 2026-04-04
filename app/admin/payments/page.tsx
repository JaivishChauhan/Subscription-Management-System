import type { Metadata } from "next"
import { IconCreditCard } from "@tabler/icons-react"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "Payments",
}

export const dynamic = "force-dynamic"

export default async function AdminPaymentsPage() {
  await requireAdminPage()

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
    take: 100,
  })

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/80 p-6 shadow-sm dark:from-card dark:via-card dark:to-card">
        <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
          Payments
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Settlement audit trail</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
          Admin users can review recorded invoice settlements and their operational provenance.
        </p>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="overflow-hidden rounded-3xl border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  <th className="px-5 py-4">Invoice</th>
                  <th className="px-5 py-4">Method</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Recorded By</th>
                  <th className="px-5 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/20">
                    <td className="px-5 py-4 font-semibold">{payment.invoice.invoiceNumber}</td>
                    <td className="px-5 py-4 text-sm capitalize text-muted-foreground">
                      {payment.paymentMethod.replaceAll("_", " ")}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium">{payment.createdBy.name}</p>
                        <p className="text-muted-foreground text-sm">{payment.createdBy.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {formatDate(payment.paymentDate)}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <IconCreditCard className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">No payments found</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Payment records will appear here as invoices are settled.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
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
