import type { Metadata } from "next"
import Link from "next/link"
import { IconApps, IconArrowRight } from "@tabler/icons-react"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "Services",
}

export const dynamic = "force-dynamic"

export default async function AdminServicesPage() {
  await requireAdminPage()

  const [services, activeCount, featuredCount] = await prisma.$transaction([
    prisma.service.findMany({
      orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
      take: 50,
    }),
    prisma.service.count({ where: { isActive: true } }),
    prisma.service.count({ where: { isFeatured: true } }),
  ])

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/80 p-6 shadow-sm dark:from-card dark:via-card dark:to-card">
        <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
          Marketplace Services
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Service catalog oversight</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
          Review the public-facing app and service catalog that powers the marketplace layer.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Visible Services" value={activeCount} />
          <SummaryCard label="Featured Services" value={featuredCount} />
          <SummaryCard label="Loaded Rows" value={services.length} />
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="overflow-hidden rounded-3xl border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Monthly Price</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Marketplace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-muted-foreground text-sm">{service.slug}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm capitalize text-muted-foreground">
                      {service.category}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium">
                      {formatCurrency(service.monthlyPrice)}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span className={pillClass(service.isActive)}>
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/shop?category=${encodeURIComponent(service.category)}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500"
                      >
                        View listing
                        <IconArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                          <IconApps className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">No services found</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Service records will appear here once the marketplace catalog is populated.
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

function pillClass(active: boolean) {
  return `inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
    active
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
      : "bg-slate-200 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300"
  }`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value)
}
