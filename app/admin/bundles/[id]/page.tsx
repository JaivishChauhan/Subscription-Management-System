import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"
import { BundleForm } from "../_components/BundleForm"

export const metadata: Metadata = {
  title: "Edit Bundle",
}

export const dynamic = "force-dynamic"

export default async function EditBundlePage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdminPage()

  const [bundle, availableServices] = await Promise.all([
    prisma.bundle.findUnique({
      where: { id: params.id },
      include: {
        services: true,
      },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ])

  if (!bundle) {
    notFound()
  }

  const initialData = {
    name: bundle.name,
    slug: bundle.slug,
    description: bundle.description || undefined,
    type: bundle.type as "predefined" | "suggested" | "custom",
    discountType: bundle.discountType as "percentage" | "fixed",
    discountValue: bundle.discountValue,
    isActive: bundle.isActive,
    isFeatured: bundle.isFeatured,
    serviceIds: bundle.services.map((s) => s.serviceId),
  }

  const servicesDto = availableServices.map((s) => ({
    ...s,
    category: s.category as import("@/types/service").ServiceCategory,
  }))

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/bundles"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-gray-50"
        >
          <IconArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Edit {bundle.name}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Modify bundle details and service inclusions.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <BundleForm
          initialData={initialData}
          id={bundle.id}
          availableServices={servicesDto}
        />
      </div>
    </div>
  )
}
