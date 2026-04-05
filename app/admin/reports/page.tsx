import type { Metadata } from "next"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "Reports",
}

export const dynamic = "force-dynamic"

export default async function AdminReportsPage() {
  await requireAdminPage()

  const [subscriptionsByStatus, invoicesByStatus, totals] = await Promise.all([
    prisma.subscription.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      _sum: { total: true, amountDue: true },
      _count: { _all: true },
    }),
    prisma.invoice.aggregate({
      _sum: { total: true, amountDue: true },
    }),
  ])

  return (
    <div className="space-y-8">
      <section className="border-border from-card via-card rounded-[2rem] border bg-gradient-to-br to-indigo-500/5 p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
          Reports
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Operational snapshot
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
          Quick system-level reporting across subscription and invoice
          lifecycles.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <MetricCard
            label="Total Invoiced"
            value={formatCurrency(totals._sum.total ?? 0)}
          />
          <MetricCard
            label="Outstanding Amount"
            value={formatCurrency(totals._sum.amountDue ?? 0)}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportTable
          title="Subscriptions by Status"
          rows={subscriptionsByStatus.map((row) => ({
            label: row.status,
            primary: String(row._count._all),
            secondary: "records",
          }))}
        />
        <ReportTable
          title="Invoices by Status"
          rows={invoicesByStatus.map((row) => ({
            label: row.status,
            primary: String(row._count._all),
            secondary: formatCurrency(row._sum.total ?? 0),
          }))}
        />
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-card/80 rounded-3xl border p-5">
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  )
}

function ReportTable({
  title,
  rows,
}: {
  title: string
  rows: Array<{ label: string; primary: string; secondary: string }>
}) {
  return (
    <section className="border-border bg-card rounded-[2rem] border p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="border-border mt-5 overflow-hidden rounded-3xl border">
        <table className="divide-border min-w-full divide-y">
          <thead className="bg-muted/40">
            <tr className="text-muted-foreground text-left text-xs font-semibold tracking-[0.18em] uppercase">
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Count</th>
              <th className="px-5 py-4">Value</th>
            </tr>
          </thead>
          <tbody className="divide-border bg-card divide-y">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="px-5 py-4 capitalize">{row.label}</td>
                <td className="px-5 py-4 font-medium">{row.primary}</td>
                <td className="text-muted-foreground px-5 py-4 text-sm">
                  {row.secondary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)
}
