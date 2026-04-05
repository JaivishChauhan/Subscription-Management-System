import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { IconCreditCard, IconCheck } from "@tabler/icons-react"

export const metadata: Metadata = {
  title: "My Payments",
  description: "View your payment history",
}

export const dynamic = "force-dynamic"

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
})

const METHOD_LABELS: Record<string, string> = {
  credit_card: "Credit Card",
  paypal: "PayPal",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  stripe: "Stripe",
  razorpay: "Razorpay",
}

/**
 * Portal Payments page — shows payment history scoped to the current user's invoices.
 * @security Data is filtered by userId — portal users cannot see other users' payments.
 */
export default async function PaymentsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const payments = await prisma.payment.findMany({
    where: {
      invoice: { userId: session.user.id },
    },
    orderBy: { paymentDate: "desc" },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
          total: true,
          status: true,
        },
      },
    },
  })

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="bg-background min-h-screen">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Payments</h1>
          <p className="text-muted-foreground mt-2">
            Your complete payment history across all invoices
          </p>
        </div>

        {/* Summary card */}
        <div className="border-border bg-card mb-6 flex items-center justify-between rounded-2xl border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <IconCreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Paid</p>
              <p className="text-xl font-bold text-emerald-600">
                {INR.format(totalPaid)}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            {payments.length} payment{payments.length === 1 ? "" : "s"}
          </p>
        </div>

        {payments.length === 0 ? (
          <div className="border-border bg-card rounded-2xl border p-12 text-center">
            <div className="bg-muted mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
              <IconCreditCard className="text-muted-foreground h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No payments yet</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Payments will appear here once an invoice has been settled.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <IconCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-mono font-semibold">
                      {payment.invoice.invoiceNumber}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {METHOD_LABELS[payment.paymentMethod] ??
                        payment.paymentMethod}
                      {" · "}
                      {new Date(payment.paymentDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-emerald-600">
                  {INR.format(payment.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
