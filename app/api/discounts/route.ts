import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAdminApi } from "@/lib/admin"
import {
  discountCreateSchema,
  discountFiltersSchema,
} from "@/lib/validations/discount"

/**
 * GET /api/discounts
 * Lists all discount rules with product applicability.
 * @security Admin-only.
 */
export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return error

  const searchParams = request.nextUrl.searchParams
  const parsed = discountFiltersSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid filters." },
      { status: 400 }
    )
  }

  const { q, status, type, page, pageSize } = parsed.data

  const where = {
    ...(status === "all" ? {} : { isActive: status === "active" }),
    ...(type === "all" ? {} : { type }),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { code: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [total, discounts] = await prisma.$transaction([
    prisma.discount.count({ where }),
    prisma.discount.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        applicableProducts: {
          include: {
            product: {
              select: { id: true, name: true },
            },
          },
        },
      },
    }),
  ])

  return NextResponse.json({
    discounts,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  })
}

/**
 * POST /api/discounts
 * Creates a new discount rule, optionally linking it to specific products.
 * @security Admin-only. Code is automatically uppercased and uniqueness-checked.
 */
export async function POST(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return error

  try {
    const body = await request.json()
    const parsed = discountCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid discount data." },
        { status: 400 }
      )
    }

    const { productIds, ...discountData } = parsed.data

    if (discountData.endDate <= discountData.startDate) {
      return NextResponse.json(
        { error: "End date must be after start date." },
        { status: 400 }
      )
    }

    const existing = await prisma.discount.findUnique({
      where: { code: discountData.code },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A discount with this code already exists." },
        { status: 409 }
      )
    }

    const discount = await prisma.discount.create({
      data: {
        ...discountData,
        applicableProducts:
          productIds.length > 0
            ? {
                create: productIds.map((productId) => ({ productId })),
              }
            : undefined,
      },
      include: {
        applicableProducts: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    })

    revalidatePath("/admin/discounts")

    return NextResponse.json({ discount }, { status: 201 })
  } catch (err) {
    console.error("[DISCOUNT_CREATE_ERROR]", err)
    return NextResponse.json(
      { error: "Unable to create discount right now." },
      { status: 500 }
    )
  }
}
