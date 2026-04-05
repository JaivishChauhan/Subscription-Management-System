import type { Metadata } from "next"
import Link from "next/link"
import { IconReceipt2, IconPlus, IconArrowRight } from "@tabler/icons-react"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"
import { TablePagination } from "@/components/ui/table-pagination"
import { subscriptionFiltersSchema } from "@/lib/validations/subscription"

export const metadata: Metadata = {
  title: "Quotations",
}

export const dynamic = "force-dynamic"

export default async function AdminQuotationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdminPage()

  const rawSearchParams = await searchParams
  const firstValue = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v

  const parsed = subscriptionFiltersSchema.parse({
    page: firstValue(rawSearchParams.page),
    pageSize: firstValue(rawSearchParams.pageSize),
  })

  const { page, pageSize } = parsed

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
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  const totalQuotations = await prisma.subscription.count({
    where: { status: "quotation" },
  })
  const totalPages = Math.max(1, Math.ceil(totalQuotations / pageSize))

  return (
    <div className="space-y-8">
      <section className="border-border from-card via-card rounded-[2rem] border bg-gradient-to-br to-indigo-500/5 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-indigo-600 uppercase">
              Quotations
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Pre-confirmation pipeline
            </h1>
          </div>
          <Link
            href="/admin/subscriptions/new"
            className="inline-flex max-w-fit items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <IconPlus className="h-4 w-4" />
            New Quotation
          </Link>
        </div>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
          This view isolates subscriptions currently in the quotation lifecycle
        </p>
      </section>

      <section className="border-border bg-card rounded-[2rem] border p-6 shadow-sm">
        <div className="border-border overflow-hidden rounded-3xl border">
          <div className="overflow-x-auto">
            <table className="divide-border min-w-full divide-y">
              <thead className="bg-muted/40">
                <tr className="text-muted-foreground text-left text-xs font-semibold tracking-[0.18em] uppercase">
                  <th className="px-5 py-4">Quotation</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Updated</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {quotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-muted/20">
                    <td className="px-5 py-4 font-semibold">
                      {quotation.subscriptionNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium">
                          {[
                            quotation.contact.firstName,
                            quotation.contact.lastName,
                          ]
                            .filter(Boolean)
                            .join(" ")
                            .trim() ||
                            quotation.contact.company ||
                            "Customer"}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {quotation.contact.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-5 py-4 text-sm">
                      {quotation.recurringPlan.name}
                    </td>
                    <td className="text-muted-foreground px-5 py-4 text-sm">
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
                        <div className="bg-muted mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                          <IconReceipt2 className="text-muted-foreground h-6 w-6" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">
                          No quotations found
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          Subscription records in quotation state will appear
                          here.
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
          totalItems={totalQuotations}
          totalPages={totalPages}
        />
      </section>
    </div>
  )
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(value)
}
