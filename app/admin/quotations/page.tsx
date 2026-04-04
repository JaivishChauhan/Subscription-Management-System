import type { Metadata } from "next"
import Link from "next/link"
import { IconArrowRight, IconReceipt2 } from "@tabler/icons-react"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "Quotations",
}

export const dynamic = "force-dynamic"

export default async function AdminQuotationsPage() {
  await requireAdminPage()

  const quotations = await prisma.subscription.findMany({
    where: { status: "quotation" },
    orderBy: { updatedAt: "desc" },
    include: {
      contact: {
        include: {
          user: {
            select: { email: true },
          },
        },
      },
      recurringPlan: {
        select: { name: true },
      },
    },
  })

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-card via-card to-indigo-500/5 p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
          Quotations
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Pre-confirmation pipeline</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
          This view isolates subscriptions currently in the quotation lifecycle stage.
        </p>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="overflow-hidden rounded-3xl border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  <th className="px-5 py-4">Quotation</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Updated</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {quotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-muted/20">
                    <td className="px-5 py-4 font-semibold">{quotation.subscriptionNumber}</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium">
                          {[quotation.contact.firstName, quotation.contact.lastName]
                            .filter(Boolean)
                            .join(" ")
                            .trim() || quotation.contact.company || "Customer"}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {quotation.contact.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {quotation.recurringPlan.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {formatDate(quotation.updatedAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/subscriptions/${quotation.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
                      >
                        Open
                        <IconArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {quotations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <IconReceipt2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">No quotations found</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Subscription records in quotation state will appear here.
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

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(value)
}
