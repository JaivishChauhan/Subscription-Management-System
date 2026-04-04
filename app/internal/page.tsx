import { DashboardClient } from "@/app/admin/_components/DashboardClient"
import { requireInternalPage } from "@/lib/admin"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function InternalDashboardPage() {
  await requireInternalPage()

  const [activeSubsCount, confirmedCount, confirmedTotalAgg, invoiceAgg, overdueCount] = await prisma.$transaction([
    prisma.subscription.count({
      where: { status: "active" },
    }),
    prisma.invoice.count({
      where: { status: "confirmed" },
    }),
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: "confirmed" },
    }),
    prisma.invoice.aggregate({
      _sum: { amountDue: true },
      where: { status: "confirmed" },
    }),
    prisma.invoice.count({
      where: {
        status: "confirmed",
        dueDate: { lt: new Date() },
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-white via-sky-50/80 to-cyan-50/70 p-6 shadow-sm dark:from-card dark:via-card dark:to-card">
        <p className="text-xs font-semibold tracking-[0.28em] text-sky-600 uppercase">
          Internal Operations
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Operational workspace</h1>
        <p className="text-muted-foreground mt-3 max-w-3xl text-sm sm:text-base">
          Internal users now land in a separate portal focused on day-to-day subscription and
          invoice operations, without the admin-only catalog and configuration modules.
        </p>
      </section>

      <DashboardClient
        stats={{
          activeSubscriptions: activeSubsCount,
          revenueMTD: confirmedTotalAgg._sum.total ?? 0,
          outstanding: invoiceAgg._sum.amountDue ?? 0,
          overdue: overdueCount,
        }}
        revenueData={[
          { month: "JAN", actual: 42, forecast: 40 },
          { month: "FEB", actual: 51, forecast: 48 },
          { month: "MAR", actual: 57, forecast: 54 },
          { month: "APR", actual: 63, forecast: 60 },
          { month: "MAY", actual: 69, forecast: 66 },
          { month: "JUN", actual: 74, forecast: 72 },
        ]}
        churnData={[
          { name: "Pending renewals", sub: "Watch upcoming activations and follow-ups.", initials: "PR" },
          { name: "Billing queue", sub: "Confirmed invoices need payment follow-through.", initials: "BQ" },
          { name: "Customer responses", sub: "Review recent operational exceptions.", initials: "CR" },
          { name: "Provisioning checks", sub: "Verify newly activated subscriptions.", initials: "PC" },
        ]}
        timeline={[
          {
            color: "#0ea5e9",
            title: "Subscriptions under watch",
            desc: "Review newly confirmed and active subscriptions from the operations queue.",
            time: "Live",
          },
          {
            color: "#06b6d4",
            title: "Invoices awaiting payment",
            desc: "Outstanding confirmed invoices are tracked for internal collection follow-up.",
            time: "Live",
          },
          {
            color: "#f97316",
            title: "Operational exception review",
            desc: "Overdue invoices and lifecycle blockers stay visible here for action.",
            time: "Live",
          },
        ]}
        planDist={[
          { name: "Active Subscriptions", pct: `${activeSubsCount}`, color: "#0ea5e9" },
          { name: "Confirmed Invoices", pct: `${confirmedCount}`, color: "#06b6d4" },
          { name: "Overdue Items", pct: `${overdueCount}`, color: "#f97316" },
        ]}
      />
    </div>
  )
}
