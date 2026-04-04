import type { Metadata } from "next"
import Link from "next/link"
import { IconArrowRight, IconPuzzle } from "@tabler/icons-react"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "Bundles",
}

export const dynamic = "force-dynamic"

export default async function AdminBundlesPage() {
  await requireAdminPage()

  const [bundles, activeCount, featuredCount] = await prisma.$transaction([
    prisma.bundle.findMany({
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
      include: {
        services: true,
      },
      take: 50,
    }),
    prisma.bundle.count({ where: { isActive: true } }),
    prisma.bundle.count({ where: { isFeatured: true } }),
  ])

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/80 p-6 shadow-sm dark:from-card dark:via-card dark:to-card">
        <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
          Marketplace Bundles
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Bundle merchandising</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
          Monitor predefined and suggested bundles that shape marketplace packaging and discounts.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Active Bundles" value={activeCount} />
          <SummaryCard label="Featured Bundles" value={featuredCount} />
          <SummaryCard label="Loaded Rows" value={bundles.length} />
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="overflow-hidden rounded-3xl border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  <th className="px-5 py-4">Bundle</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Discount</th>
                  <th className="px-5 py-4">Services</th>
                  <th className="px-5 py-4">Marketplace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {bundles.map((bundle) => (
                  <tr key={bundle.id} className="hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold">{bundle.name}</p>
                        <p className="text-muted-foreground text-sm">{bundle.slug}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm capitalize text-muted-foreground">
                      {bundle.type}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium">
                      {bundle.discountType === "fixed"
                        ? formatCurrency(bundle.discountValue)
                        : `${bundle.discountValue}%`}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {bundle.services.length}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href="/bundles"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
                      >
                        View bundles
                        <IconArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {bundles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <IconPuzzle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">No bundles found</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Bundle records will appear here once marketplace packaging is configured.
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

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border bg-card/80 p-5">
      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
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
