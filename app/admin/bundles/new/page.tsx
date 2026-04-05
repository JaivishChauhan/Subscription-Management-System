import type { Metadata } from "next"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { requireAdminPage } from "@/lib/admin"
import { prisma } from "@/lib/db"
import { BundleForm } from "../_components/BundleForm"

export const metadata: Metadata = {
  title: "New Bundle",
}

export const dynamic = "force-dynamic"

export default async function NewBundlePage() {
  await requireAdminPage()

  const availableServices = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })

  // Map to DTO
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
            Create Bundle
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Configure a new service bundle for the marketplace.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <BundleForm availableServices={servicesDto} />
      </div>
    </div>
  )
}
