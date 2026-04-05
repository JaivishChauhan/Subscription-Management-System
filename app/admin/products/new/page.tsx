import type { Metadata } from "next"
import { ProductForm } from "../_components/ProductForm"
import { requireAdminPage } from "@/lib/admin"

export const metadata: Metadata = {
  title: "New Product",
}

export default async function NewProductPage() {
  await requireAdminPage()

  return <ProductForm mode="create" />
}
