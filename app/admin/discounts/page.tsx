import type { Metadata } from "next"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"
import { AdminDiscountsClient } from "./_components/AdminDiscountsClient"

export const metadata: Metadata = {
  title: "Discount Management | Admin",
  description: "Create and manage promo codes and discount rules",
}

export const dynamic = "force-dynamic"

/**
 * Admin Discounts page — server component that loads initial discount list.
 * @security Requires admin role via requireAdminPage().
 */
export default async function AdminDiscountsPage() {
  await requireAdminPage()

  const [total, discounts] = await prisma.$transaction([
    prisma.discount.count(),
    prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        applicableProducts: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ])

  // Explicit DTO — avoid TypeScript errors from Prisma spread type inference
  const safeDiscounts = discounts.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    type: d.type as "fixed" | "percentage",
    value: d.value,
    minPurchase: d.minPurchase,
    usageLimit: d.usageLimit,
    usageCount: d.usageCount,
    startDate: d.startDate.toISOString(),
    endDate: d.endDate.toISOString(),
    isActive: d.isActive,
    applicableProducts: d.applicableProducts.map((ap) => ({
      product: { id: ap.product.id, name: ap.product.name },
    })),
  }))

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-card via-card to-violet-500/5 p-6 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.28em] text-violet-600 uppercase">
          Promotions
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Discounts &amp; Promo Codes</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Create and manage discount rules — fixed amount, percentage-based, with
          optional usage limits, minimum purchase thresholds, and product restrictions.
        </p>
      </section>

      <AdminDiscountsClient initialDiscounts={safeDiscounts} initialTotal={total} />
    </div>
  )
}
