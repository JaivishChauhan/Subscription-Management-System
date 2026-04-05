import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdminApi } from "@/lib/admin"

/**
 * PATCH /api/services/[id]
 * @security Admin-only. Partial update (only provided fields are updated).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi()
  if (error) {
    return error
  }

  const { id } = await params

  try {
    const body = await req.json()

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
        ...(body.iconKey !== undefined && { iconKey: body.iconKey }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.monthlyPrice !== undefined && {
          monthlyPrice: Number(body.monthlyPrice),
        }),
        ...(body.yearlyPrice !== undefined && {
          yearlyPrice: body.yearlyPrice ? Number(body.yearlyPrice) : null,
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      },
    })

    return NextResponse.json(service)
  } catch (err) {
    console.error("[PATCH /api/services/:id]", err)
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/services/[id]
 * @security Admin-only. Soft-delete only (isActive = false). Data is never hard-deleted.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminApi()
  if (error) {
    return error
  }

  const { id } = await params

  try {
    await prisma.service.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/services/:id]", err)
    return NextResponse.json(
      { error: "Failed to deactivate service" },
      { status: 500 }
    )
  }
}
