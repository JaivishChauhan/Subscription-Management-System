import type { Metadata } from "next"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "Settings",
}

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  await requireAdminPage()

  const [users, paymentTerms, taxes, plans] = await prisma.$transaction([
    prisma.user.findMany({
      select: {
        role: true,
      },
    }),
    prisma.paymentTerms.count(),
    prisma.tax.count(),
    prisma.recurringPlan.count(),
  ])

  const roleCounts = users.reduce<Record<string, number>>((acc, user) => {
    acc[user.role] = (acc[user.role] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <section className="border-border from-card via-card rounded-[2rem] border bg-gradient-to-br to-indigo-500/5 p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          System configuration overview
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
          High-level admin visibility into user roles and configurable business
          foundations.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border-border bg-card rounded-[2rem] border p-6 shadow-sm">
          <h2 className="text-lg font-semibold">User Roles</h2>
          <div className="mt-5 space-y-3">
            {Object.entries(roleCounts).map(([role, count]) => (
              <div
                key={role}
                className="border-border flex items-center justify-between rounded-2xl border p-4"
              >
                <span className="text-muted-foreground capitalize">{role}</span>
                <span className="text-xl font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border-border bg-card rounded-[2rem] border p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Business Configuration</h2>
          <div className="mt-5 space-y-3">
            <ConfigRow label="Recurring Plans" value={plans} />
            <ConfigRow label="Tax Rules" value={taxes} />
            <ConfigRow label="Payment Terms" value={paymentTerms} />
          </div>
        </section>
      </div>
    </div>
  )
}

function ConfigRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border flex items-center justify-between rounded-2xl border p-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-xl font-semibold">{value}</span>
    </div>
  )
}
