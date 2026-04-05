import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { ServiceForm } from "../_components/ServiceForm"
import type { ServiceCategory } from "@/types/service"

export const metadata = {
  title: "Edit Service | Admin",
  description: "Edit an existing marketplace service.",
}

type EditServicePageProps = {
  params: {
    id: string
  }
}

export default async function EditServicePage({
  params,
}: EditServicePageProps) {
  const { id } = await params

  const service = await prisma.service.findUnique({
    where: { id },
  })

  if (!service) {
    notFound()
  }

  // Type cast for safe passing into our components
  const serviceData = {
    ...service,
    category: service.category as ServiceCategory,
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit Service</h1>
        <p className="text-muted-foreground text-base">
          Update the details, pricing, and settings for {service.name}.
        </p>
      </div>

      <ServiceForm mode="edit" initialData={serviceData} />
    </div>
  )
}
