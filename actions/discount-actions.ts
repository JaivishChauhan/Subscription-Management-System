"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireApiRole } from "@/lib/admin"
import {
  discountCreateSchema,
  discountUpdateSchema,
} from "@/lib/validations/discount"

export async function createDiscountAction(formData: unknown) {
  await requireApiRole(["admin"])

  const parsed = discountCreateSchema.safeParse(formData)

  if (!parsed.success) {
    return { error: "Invalid form data.", details: parsed.error.flatten() }
  }

  const { productIds, ...data } = parsed.data

  try {
    const existing = await prisma.discount.findUnique({
      where: { code: data.code },
    })

    if (existing) {
      return { error: "A discount with this code already exists." }
    }

    const discount = await prisma.discount.create({
      data: {
        ...data,
        ...(productIds.length > 0 && {
          products: {
            create: productIds.map((id) => ({
              product: { connect: { id } },
            })),
          },
        }),
      },
    })

    revalidatePath("/admin/discounts")
    return { success: true, discount }
  } catch (error) {
    console.error("Failed to create discount:", error)
    return { error: "Failed to create discount." }
  }
}

export async function updateDiscountAction(id: string, formData: unknown) {
  await requireApiRole(["admin"])

  const parsed = discountCreateSchema.safeParse(formData)

  if (!parsed.success) {
    return { error: "Invalid form data.", details: parsed.error.flatten() }
  }

  const { productIds, ...data } = parsed.data

  try {
    const existing = await prisma.discount.findUnique({
      where: { code: data.code },
    })

    if (existing && existing.id !== id) {
      return { error: "Another discount with this code already exists." }
    }

    const discount = await prisma.$transaction(async (tx) => {
      // Clear existing product links
      await tx.discountProduct.deleteMany({
        where: { discountId: id },
      })

      // Update discount and insert new links
      return tx.discount.update({
        where: { id },
        data: {
          ...data,
          ...(productIds.length > 0 && {
            products: {
              create: productIds.map((productId) => ({
                product: { connect: { id: productId } },
              })),
            },
          }),
        },
      })
    })

    revalidatePath("/admin/discounts")
    revalidatePath(`/admin/discounts/${id}`)
    return { success: true, discount }
  } catch (error) {
    console.error("Failed to update discount:", error)
    return { error: "Failed to update discount." }
  }
}
