import type { Metadata } from "next"
import { IconCalendar } from "@tabler/icons-react"
import { prisma } from "@/lib/db"
import { requireInternalPage } from "@/lib/admin"

export const metadata: Metadata = {
  title: "Recurring Plans | Internal",
}

export const dynamic = "force-dynamic"

const PERIOD_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
}

/**
 * Internal Plans page — read-only view of recurring billing plans.
 * @security Requires internal role.
 */
export default async function InternalPlansPage() {
  await requireInternalPage()

  const plans = await prisma.recurringPlan.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { subscriptions: true } },
    },
  })

  return (
    <div className="space-y-8">
      <section className="border-border from-card via-card rounded-[2rem] border bg-gradient-to-br to-sky-500/5 p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.28em] text-sky-600 uppercase">
          Billing
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Recurring Plans
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
          Review available recurring billing plans and their configurations.
          Modifications require Admin access.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.length === 0 ? (
          <div className="border-border bg-card col-span-full flex flex-col items-center justify-center rounded-2xl border py-20">
            <IconCalendar className="text-muted-foreground h-10 w-10" />
            <p className="mt-4 font-semibold">No plans configured</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="border-border bg-card rounded-2xl border p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{plan.name}</h2>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {PERIOD_LABELS[plan.billingPeriod] ?? plan.billingPeriod}{" "}
                    billing
                  </p>
                </div>
                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                  {plan._count.subscriptions} subscriptions
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Min Quantity</p>
                  <p className="font-medium">{plan.minQuantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Features</p>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {plan.autoClose && (
                      <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                        Auto-close
                      </span>
                    )}
                    {plan.closable && (
                      <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                        Closable
                      </span>
                    )}
                    {plan.pausable && (
                      <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                        Pausable
                      </span>
                    )}
                    {plan.renewable && (
                      <span className="bg-muted rounded-full px-2 py-0.5 text-xs">
                        Renewable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
