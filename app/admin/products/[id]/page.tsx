import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductForm } from "../_components/ProductForm"
import { prisma } from "@/lib/db"
import { requireAdminPage } from "@/lib/admin"
import type { ProductType } from "@/lib/validations/product"

type ProductDetailPageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Edit Product",
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  await requireAdminPage()

  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      type: true,
      salesPrice: true,
      costPrice: true,
      description: true,
      notes: true,
      image: true,
      isActive: true,
    },
  })

  if (!product) {
    notFound()
  }

  return (
    <ProductForm
      mode="edit"
      initialProduct={{
        ...product,
        type: (product.type === "goods" ? "goods" : "service") as ProductType,
      }}
    />
  )
}
