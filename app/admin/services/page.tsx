import type { Metadata } from "next"
import { TablePagination } from "@/components/ui/table-pagination"
import Link from "next/link"
import { IconApps, IconArrowRight, IconSearch } from "@tabler/icons-react"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"
import { serviceFiltersSchema } from "@/lib/validations/service"

export const metadata: Metadata = {
  title: "Services",
}

export const dynamic = "force-dynamic"

type AdminServicesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminServicesPage({
  searchParams,
}: AdminServicesPageProps) {
  await requireAdminPage()

  const rawSearchParams = await searchParams
  const firstValue = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v

  const parsed = serviceFiltersSchema.parse({
    q: firstValue(rawSearchParams.q),
    status: firstValue(rawSearchParams.status),
    category: firstValue(rawSearchParams.category),
    page: firstValue(rawSearchParams.page),
    pageSize: firstValue(rawSearchParams.pageSize),
  })

  const { q, status, category, page, pageSize } = parsed
  const where = {
    ...(q
      ? {
          name: {
            contains: q,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(status === "all" ? {} : { isActive: status === "active" }),
    ...(category ? { category } : {}),
  }

  const services = await prisma.service.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  })
  const totalServices = await prisma.service.count({ where })
  const activeCount = await prisma.service.count({ where: { isActive: true } })
  const featuredCount = await prisma.service.count({
    where: { isFeatured: true },
  })
  const categories = await prisma.service.groupBy({
    by: ["category"],
    _count: { category: true },
    orderBy: { category: "asc" },
  })

  const totalPages = Math.max(1, Math.ceil(totalServices / pageSize))

  return (
    <div className="space-y-8">
      <section className="border-border from-card via-card rounded-[2rem] border bg-gradient-to-br to-indigo-500/5 p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
              Marketplace Services
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Service catalog oversight
            </h1>
          </div>
          <Link
            href="/admin/services/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <IconApps className="h-4 w-4" />
            New Service
          </Link>
        </div>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
          Review the public-facing app and service catalog that powers the
          marketplace layer.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Visible Services" value={activeCount} />
          <SummaryCard label="Featured Services" value={featuredCount} />
          <SummaryCard label="Loaded Rows" value={services.length} />
        </div>
      </section>

      <section className="border-border bg-card rounded-[2rem] border p-6 shadow-sm">
        <div className="border-border overflow-hidden rounded-3xl border">
          <div className="overflow-x-auto">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/40">
                <tr className="text-muted-foreground text-left text-xs font-semibold tracking-[0.18em] uppercase">
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Monthly Price</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Marketplace</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {service.slug}
                        </p>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-5 py-4 text-sm capitalize">
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
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/services/${service.id}`}
                        className="hover:bg-muted text-muted-foreground hover:text-foreground inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center">
                      <div className="mx-auto max-w-md">
                        <div className="bg-muted mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                          <IconApps className="text-muted-foreground h-6 w-6" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">
                          No services found
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Service records will appear here once the marketplace
                          catalog is populated.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={totalServices}
          totalPages={totalPages}
        />
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
