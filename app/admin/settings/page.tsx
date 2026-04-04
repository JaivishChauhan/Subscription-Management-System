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
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
    prisma.paymentTerms.count(),
    prisma.tax.count(),
    prisma.recurringPlan.count(),
  ])

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/80 p-6 shadow-sm dark:from-card dark:via-card dark:to-card">
        <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">System configuration overview</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
          High-level admin visibility into user roles and configurable business foundations.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">User Roles</h2>
          <div className="mt-5 space-y-3">
            {users.map((row) => (
              <div
                key={row.role}
                className="flex items-center justify-between rounded-2xl border border-border p-4"
              >
                <span className="capitalize text-muted-foreground">{row.role}</span>
                <span className="text-xl font-semibold">{row._count._all}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
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
    <div className="flex items-center justify-between rounded-2xl border border-border p-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-xl font-semibold">{value}</span>
    </div>
  )
}
