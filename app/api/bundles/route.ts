import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdminApi } from "@/lib/admin"
import { computeBundleFinalPrice } from "@/types/bundle"
import type { ServiceDTO } from "@/types/service"
import type { Bundle, BundleService, Service } from "@prisma/client"

/**
 * GET /api/bundles
 * Public — returns all active bundles with their services and computed pricing.
 * Supports ?type=predefined|suggested|custom and ?featured=true
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const featured = searchParams.get("featured") === "true"

  try {
    const bundles = await prisma.bundle.findMany({
      where: {
        isActive: true,
        ...(type ? { type } : {}),
        ...(featured ? { isFeatured: true } : {}),
      },
      include: {
        services: {
          orderBy: { order: "asc" },
          include: { service: true },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    })

    type BundleWithServices = Bundle & {
      services: (BundleService & { service: Service })[]
    }

    const bundleDTOs = bundles.map((b: BundleWithServices) => {
      const services: ServiceDTO[] = b.services.map((bs) => ({
        id: bs.service.id,
        name: bs.service.name,
        slug: bs.service.slug,
        description: bs.service.description,
        category: bs.service.category as ServiceDTO["category"],
        logoUrl: bs.service.logoUrl,
        iconKey: bs.service.iconKey,
        color: bs.service.color,
        monthlyPrice: bs.service.monthlyPrice,
        yearlyPrice: bs.service.yearlyPrice,
        isActive: bs.service.isActive,
        isFeatured: bs.service.isFeatured,
      }))

      const originalPrice = services.reduce((sum, s) => sum + s.monthlyPrice, 0)
      const finalPrice = computeBundleFinalPrice(
        originalPrice,
        b.discountType as "percentage" | "fixed",
        b.discountValue
      )

      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        description: b.description,
        type: b.type,
        discountType: b.discountType,
        discountValue: b.discountValue,
        isActive: b.isActive,
        isFeatured: b.isFeatured,
        services,
        originalPrice,
        finalPrice,
      }
    })

    return NextResponse.json(bundleDTOs)
  } catch (err) {
    console.error("[GET /api/bundles]", err)
    return NextResponse.json(
      { error: "Failed to fetch bundles" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bundles
 * @security Admin-only. Creates bundle and its BundleService join records.
 */
export async function POST(req: NextRequest) {
  const { error, session } = await requireAdminApi()
  if (error) {
    return error
  }

  try {
    const body = await req.json()

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug" },
        { status: 400 }
      )
    }

    const serviceIds: string[] = Array.isArray(body.serviceIds)
      ? body.serviceIds
      : []

    const bundle = await prisma.bundle.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description ?? null,
        type: body.type ?? "predefined",
        discountType: body.discountType ?? "percentage",
        discountValue: Number(body.discountValue ?? 0),
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        createdById: session.user.id ?? null,
        services: {
          create: serviceIds.map((serviceId, order) => ({ serviceId, order })),
        },
      },
      include: { services: { include: { service: true } } },
    })

    return NextResponse.json(bundle, { status: 201 })
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Bundle slug already exists" },
        { status: 409 }
      )
    }
    console.error("[POST /api/bundles]", err)
    return NextResponse.json(
      { error: "Failed to create bundle" },
      { status: 500 }
    )
  }
}
