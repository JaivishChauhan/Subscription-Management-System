import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireApiRole, requireAdminApi } from "@/lib/admin"
import {
  productCreateSchema,
  productFiltersSchema,
} from "@/lib/validations/product"

export async function GET(request: NextRequest) {
  const { error } = await requireApiRole(["admin", "internal"])
  if (error) {
    return error
  }

  const searchParams = request.nextUrl.searchParams
  const parsed = productFiltersSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid filters." },
      { status: 400 }
    )
  }

  const { q, status, page, pageSize } = parsed.data
  const where = {
    ...(q
      ? {
          name: {
            contains: q,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(status === "all" ? {} : { isActive: status === "active" }),
  }

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
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
        createdAt: true,
        updatedAt: true,
      },
    }),
  ])

  return NextResponse.json({
    products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  })
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) {
    return error
  }

  try {
    const body = await request.json()
    const parsed = productCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid product data." },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: parsed.data,
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

    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/${product.id}`)

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("[PRODUCT_CREATE_ERROR]", error)
    return NextResponse.json(
      { error: "Unable to create product right now." },
      { status: 500 }
    )
  }
}
