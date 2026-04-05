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

export async function validateDiscountAction(
  code: string,
  payload: { subtotal: number; items: { id: string; quantity: number }[] }
) {
  try {
    const discount = await prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        applicableProducts: true,
      },
    })

    if (!discount || !discount.isActive) {
      return { error: "Invalid or inactive discount code." }
    }

    const now = new Date()
    if (now < discount.startDate || now > discount.endDate) {
      return { error: "Discount code is expired or not yet valid." }
    }

    if (
      discount.usageLimit !== null &&
      discount.usageCount >= discount.usageLimit
    ) {
      return { error: "Discount code usage limit reached." }
    }

    if (discount.minPurchase && payload.subtotal < discount.minPurchase) {
      return {
        error: `Minimum purchase amount of ₹${discount.minPurchase} required.`,
      }
    }

    const totalQuantity = payload.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    )
    if (discount.minQuantity && totalQuantity < discount.minQuantity) {
      return {
        error: `Minimum purchase quantity of ${discount.minQuantity} items required.`,
      }
    }

    if (discount.applicableProducts.length > 0) {
      const applicableProductIds = discount.applicableProducts.map(
        (p) => p.productId
      )
      // Check if any cart item ID includes the applicable product IDs
      // This is a naive check because cart item IDs are formatted like `${productId}-yearly` or `pre-bundle-${bundleId}-${plan}`
      const hasApplicableProduct = payload.items.some((item) =>
        applicableProductIds.some((pId) => item.id.includes(pId))
      )
      if (!hasApplicableProduct) {
        return {
          error: "Discount code is not applicable to any items in your cart.",
        }
      }
    }

    return {
      success: true,
      discount: {
        code: discount.code,
        type: (discount.type === "percentage" ? "percent" : "fixed") as "percent" | "fixed",
        value: discount.value,
      },
    }
  } catch (error) {
    console.error("Failed to validate discount code:", error)
    return { error: "Failed to validate discount code." }
  }
}
