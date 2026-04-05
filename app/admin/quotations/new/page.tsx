import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"
import { QuotationTemplateForm } from "./_components/QuotationTemplateForm"

export default async function NewQuotationTemplatePage() {
  await requireAdminPage()

  const plans = await prisma.recurringPlan.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  })

  // To allow quick inline selection of standard products for templates
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, salesPrice: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/quotations"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            New Quotation Template
          </h1>
          <p className="text-muted-foreground text-sm">
            Create reusable subscription bundle templates.
          </p>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border shadow-sm">
        <QuotationTemplateForm plans={plans} products={products} />
      </div>
    </div>
  )
}
