import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAdminApi } from "@/lib/admin"
import { discountUpdateSchema } from "@/lib/validations/discount"

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/discounts/[id]
 * Returns a single discount with its applicable products.
 * @security Admin-only.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { error } = await requireAdminApi()
  if (error) return error

  const { id } = await context.params

  const discount = await prisma.discount.findUnique({
    where: { id },
    include: {
      applicableProducts: {
        include: {
          product: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!discount) {
    return NextResponse.json({ error: "Discount not found." }, { status: 404 })
  }

  return NextResponse.json({ discount })
}

/**
 * PATCH /api/discounts/[id]
 * Partial update — replaces product links atomically if `productIds` is present.
 * @security Admin-only.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { error } = await requireAdminApi()
  if (error) return error

  const { id } = await context.params

  try {
    const body = await request.json()
    const parsed = discountUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid discount data." },
        { status: 400 }
      )
    }

    const existing = await prisma.discount.findUnique({
      where: { id },
      select: { id: true, startDate: true, endDate: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Discount not found." },
        { status: 404 }
      )
    }

    const { productIds, ...discountData } = parsed.data

    // Validate date range coherence if both dates are in the update
    const effectiveStart = discountData.startDate ?? existing.startDate
    const effectiveEnd = discountData.endDate ?? existing.endDate
    if (effectiveEnd <= effectiveStart) {
      return NextResponse.json(
        { error: "End date must be after start date." },
        { status: 400 }
      )
    }

    const discount = await prisma.$transaction(async (tx) => {
      // Replace product links if provided
      if (productIds !== undefined) {
        await tx.discountProduct.deleteMany({ where: { discountId: id } })
        if (productIds.length > 0) {
          await tx.discountProduct.createMany({
            data: productIds.map((productId) => ({
              discountId: id,
              productId,
            })),
            skipDuplicates: true,
          })
        }
      }

      return tx.discount.update({
        where: { id },
        data: discountData,
        include: {
          applicableProducts: {
            include: {
              product: { select: { id: true, name: true } },
            },
          },
        },
      })
    })

    revalidatePath("/admin/discounts")
    revalidatePath(`/admin/discounts/${id}`)

    return NextResponse.json({ discount })
  } catch (err) {
    console.error("[DISCOUNT_UPDATE_ERROR]", err)
    return NextResponse.json(
      { error: "Unable to update discount right now." },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/discounts/[id]
 * Hard-deletes the discount (cascades DiscountProduct records via Prisma schema).
 * @security Admin-only.
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { error } = await requireAdminApi()
  if (error) return error

  const { id } = await context.params

  try {
    const existing = await prisma.discount.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Discount not found." },
        { status: 404 }
      )
    }

    await prisma.discount.delete({ where: { id } })

    revalidatePath("/admin/discounts")

    return NextResponse.json({ message: "Discount deleted successfully." })
  } catch (err) {
    console.error("[DISCOUNT_DELETE_ERROR]", err)
    return NextResponse.json(
      { error: "Unable to delete discount right now." },
      { status: 500 }
    )
  }
}
