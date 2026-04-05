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
      <section className="border-border from-card via-card rounded-[2rem] border bg-gradient-to-br to-indigo-500/5 p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
              Marketplace Bundles
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Bundle merchandising
            </h1>
          </div>
          <Link
            href="/admin/bundles/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <IconPuzzle className="h-4 w-4" />
            New Bundle
          </Link>
        </div>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
          Monitor predefined and suggested bundles that shape marketplace
          packaging and discounts.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Active Bundles" value={activeCount} />
          <SummaryCard label="Featured Bundles" value={featuredCount} />
          <SummaryCard label="Loaded Rows" value={bundles.length} />
        </div>
      </section>

      <section className="border-border bg-card rounded-[2rem] border p-6 shadow-sm">
        <div className="border-border overflow-hidden rounded-3xl border">
          <div className="overflow-x-auto">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/40">
                <tr className="text-muted-foreground text-left text-xs font-semibold tracking-[0.18em] uppercase">
                  <th className="px-5 py-4">Bundle</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Discount</th>
                  <th className="px-5 py-4">Services</th>
                  <th className="px-5 py-4">Marketplace</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {bundles.map((bundle) => (
                  <tr key={bundle.id} className="hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold">{bundle.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {bundle.slug}
                        </p>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-5 py-4 text-sm capitalize">
                      {bundle.type}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium">
                      {bundle.discountType === "fixed"
                        ? formatCurrency(bundle.discountValue)
                        : `${bundle.discountValue}%`}
                    </td>
                    <td className="text-muted-foreground px-5 py-4 text-sm">
                      {bundle.services.length}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/bundles/${bundle.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
                      >
                        {" "}
                        Edit
                        <IconArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {bundles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="bg-muted mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                          <IconPuzzle className="text-muted-foreground h-6 w-6" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">
                          No bundles found
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Bundle records will appear here once marketplace
                          packaging is configured.
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
    <div className="border-border bg-card/80 rounded-3xl border p-5">
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.2em] uppercase">
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
