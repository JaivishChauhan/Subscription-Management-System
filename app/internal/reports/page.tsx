import type { Metadata } from "next"
import { IconChartBar, IconFileInvoice, IconRepeat, IconCreditCard, IconUsers } from "@tabler/icons-react"
import { prisma } from "@/lib/db"
import { requireInternalPage } from "@/lib/admin"

export const metadata: Metadata = {
  title: "Reports | Internal",
}

export const dynamic = "force-dynamic"

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })

/**
 * Internal Reports page — key operational metrics and summary stats.
 * @security Requires internal role.
 */
export default async function InternalReportsPage() {
  await requireInternalPage()

  const [
    totalContacts,
    activeSubscriptions,
    totalInvoices,
    paidInvoicesAgg,
    pendingInvoicesAgg,
    totalPaymentsAgg,
    recentPayments,
  ] = await prisma.$transaction([
    prisma.contact.count(),
    prisma.subscription.count({ where: { status: "active" } }),
    prisma.invoice.count(),
    prisma.invoice.aggregate({ where: { status: "paid" }, _sum: { total: true }, _count: { id: true } }),
    prisma.invoice.aggregate({ where: { status: "confirmed" }, _sum: { amountDue: true }, _count: { id: true } }),
    prisma.payment.aggregate({ _sum: { amount: true }, _count: { id: true } }),
    prisma.payment.findMany({
      orderBy: { paymentDate: "desc" },
      take: 10,
      include: {
        invoice: { select: { invoiceNumber: true } },
        createdBy: { select: { name: true } },
      },
    }),
  ])

  // Subscription status breakdown — done outside the transaction to avoid groupBy TS issues
  const subscriptionsByStatus = await prisma.subscription.groupBy({
    by: ["status"],
    _count: { id: true },
  })

  const revenue = paidInvoicesAgg._sum.total ?? 0
  const outstanding = pendingInvoicesAgg._sum.amountDue ?? 0
  const totalCollected = totalPaymentsAgg._sum.amount ?? 0

  /** Map of status → count built from groupBy result */
  const statusMap = Object.fromEntries(
    subscriptionsByStatus.map((s) => [s.status, s._count.id])
  )

  const statCards = [
    { label: "Total Contacts", value: totalContacts, icon: IconUsers, color: "text-sky-600 bg-sky-100 dark:bg-sky-900/30" },
    { label: "Active Subscriptions", value: activeSubscriptions, icon: IconRepeat, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
    { label: "Total Invoices", value: totalInvoices, icon: IconFileInvoice, color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30" },
    { label: "Payments Collected", value: totalPaymentsAgg._count.id, icon: IconCreditCard, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  ]

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-card via-card to-sky-500/5 p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.28em] text-sky-600 uppercase">Analytics</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Reports Overview</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Key operational metrics across subscriptions, invoices, and payments.
        </p>
      </section>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-bold">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Revenue Collected</p>
          <p className="mt-3 text-3xl font-bold text-emerald-600">{INR.format(revenue)}</p>
          <p className="mt-1 text-sm text-muted-foreground">From {paidInvoicesAgg._count.id} paid invoices</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Outstanding</p>
          <p className="mt-3 text-3xl font-bold text-amber-600">{INR.format(outstanding)}</p>
          <p className="mt-1 text-sm text-muted-foreground">From {pendingInvoicesAgg._count.id} confirmed invoices</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Total Payments</p>
          <p className="mt-3 text-3xl font-bold">{INR.format(totalCollected)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{totalPaymentsAgg._count.id} payments recorded</p>
        </div>
      </div>

      {/* Subscription Status Breakdown */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Subscription Status Breakdown</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(["draft", "quotation", "confirmed", "active", "closed"] as const).map((status) => (
            <div key={status} className="rounded-xl border border-border bg-muted/40 p-4 text-center">
              <p className="text-2xl font-bold">{statusMap[status] ?? 0}</p>
              <p className="mt-1 text-xs font-semibold capitalize text-muted-foreground">{status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Payments</h2>
        <div className="space-y-3">
          {recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold font-mono">{p.invoice.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    {p.createdBy ? ` · ${p.createdBy.name}` : ""}
                  </p>
                </div>
                <span className="font-bold text-emerald-600">{INR.format(p.amount)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
