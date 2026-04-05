import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireApiRole, requireAdminApi } from "@/lib/admin"
import {
  recurringPlanCreateSchema,
  recurringPlanFiltersSchema,
} from "@/lib/validations/plan"

export async function GET(request: NextRequest) {
  const { error } = await requireApiRole(["admin", "internal"])
  if (error) {
    return error
  }

  const searchParams = request.nextUrl.searchParams
  const parsed = recurringPlanFiltersSchema.safeParse({
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

  const [total, plans] = await prisma.$transaction([
    prisma.recurringPlan.count({ where }),
    prisma.recurringPlan.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        billingPeriod: true,
        price: true,
        minQuantity: true,
        startDate: true,
        endDate: true,
        autoClose: true,
        closable: true,
        pausable: true,
        renewable: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ])

  return NextResponse.json({
    plans,
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
    const parsed = recurringPlanCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid plan data." },
        { status: 400 }
      )
    }

    const plan = await prisma.recurringPlan.create({
      data: parsed.data,
      select: {
        id: true,
        name: true,
        billingPeriod: true,
        price: true,
        minQuantity: true,
        startDate: true,
        endDate: true,
        autoClose: true,
        closable: true,
        pausable: true,
        renewable: true,
        isActive: true,
      },
    })

    revalidatePath("/admin/plans")
    revalidatePath(`/admin/plans/${plan.id}`)

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error("[PLAN_CREATE_ERROR]", error)
    return NextResponse.json(
      { error: "Unable to create plan right now." },
      { status: 500 }
    )
  }
}
