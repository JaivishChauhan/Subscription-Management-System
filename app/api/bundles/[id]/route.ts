import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdminApi } from "@/lib/admin"

/**
 * PATCH /api/bundles/[id]
 * @security Admin-only. Replaces BundleService records if serviceIds provided.
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
    const serviceIds: string[] | undefined = Array.isArray(body.serviceIds)
      ? body.serviceIds
      : undefined

    // If serviceIds provided, atomically replace all BundleService rows
    if (serviceIds !== undefined) {
      await prisma.bundleService.deleteMany({ where: { bundleId: id } })
    }

    const bundle = await prisma.bundle.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.discountType !== undefined && {
          discountType: body.discountType,
        }),
        ...(body.discountValue !== undefined && {
          discountValue: Number(body.discountValue),
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
        ...(serviceIds !== undefined && {
          services: {
            create: serviceIds.map((serviceId, order) => ({
              serviceId,
              order,
            })),
          },
        }),
      },
      include: { services: { include: { service: true } } },
    })

    return NextResponse.json(bundle)
  } catch (err) {
    console.error("[PATCH /api/bundles/:id]", err)
    return NextResponse.json(
      { error: "Failed to update bundle" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/bundles/[id]
 * @security Admin-only. Soft-delete (isActive = false).
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
    await prisma.bundle.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/bundles/:id]", err)
    return NextResponse.json(
      { error: "Failed to deactivate bundle" },
      { status: 500 }
    )
  }
}
