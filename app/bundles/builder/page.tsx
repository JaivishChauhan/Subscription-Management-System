import { prisma as db } from "@/lib/db"
import { BundleBuilderClient } from "./_components/BundleBuilderClient"

export const revalidate = 3600

export default async function BundleBuilderPage() {
  const allServices = await db.service.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
  })

  const availableServices = allServices.map((svc) => ({
    id: svc.id,
    name: svc.name,
    category: svc.category,
    monthlyPrice: svc.monthlyPrice,
    logoUrl: svc.logoUrl,
    iconKey: svc.iconKey,
    color: svc.color,
  }))

  return <BundleBuilderClient availableServices={availableServices} />
}
