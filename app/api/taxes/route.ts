import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireApiRole, requireAdminApi } from "@/lib/admin"
import { taxCreateSchema, taxFiltersSchema } from "@/lib/validations/tax"

export async function GET(request: NextRequest) {
  const { error } = await requireApiRole(["admin", "internal"])
  if (error) {
    return error
  }

  const searchParams = request.nextUrl.searchParams
  const parsed = taxFiltersSchema.safeParse({
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

  const [total, taxes] = await prisma.$transaction([
    prisma.tax.count({ where }),
    prisma.tax.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        type: true,
        rate: true,
        description: true,
        isActive: true,
        createdAt: true,
      },
    }),
  ])

  return NextResponse.json({
    taxes,
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
    const parsed = taxCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid tax data." },
        { status: 400 }
      )
    }

    const tax = await prisma.tax.create({
      data: parsed.data,
      select: {
        id: true,
        name: true,
        type: true,
        rate: true,
        description: true,
        isActive: true,
      },
    })

    revalidatePath("/admin/taxes")
    revalidatePath(`/admin/taxes/${tax.id}`)

    return NextResponse.json({ tax }, { status: 201 })
  } catch (error) {
    console.error("[TAX_CREATE_ERROR]", error)
    return NextResponse.json(
      { error: "Unable to create tax right now." },
      { status: 500 }
    )
  }
}
