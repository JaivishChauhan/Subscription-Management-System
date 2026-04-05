import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAdminApi } from "@/lib/admin"
import { recurringPlanUpdateSchema } from "@/lib/validations/plan"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { error } = await requireAdminApi()
  if (error) {
    return error
  }

  try {
    const { id } = await context.params
    const body = await request.json()
    const parsed = recurringPlanUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid plan data." },
        { status: 400 }
      )
    }

    const existingPlan = await prisma.recurringPlan.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 })
    }

    const plan = await prisma.recurringPlan.update({
      where: { id },
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
    revalidatePath(`/admin/plans/${id}`)

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("[PLAN_UPDATE_ERROR]", error)
    return NextResponse.json(
      { error: "Unable to update plan right now." },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { error } = await requireAdminApi()
  if (error) {
    return error
  }

  try {
    const { id } = await context.params

    const existingPlan = await prisma.recurringPlan.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 })
    }

    const plan = await prisma.recurringPlan.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        isActive: true,
      },
    })

    revalidatePath("/admin/plans")
    revalidatePath(`/admin/plans/${id}`)

    return NextResponse.json({
      message: "Plan deactivated successfully.",
      plan,
    })
  } catch (error) {
    console.error("[PLAN_DELETE_ERROR]", error)
    return NextResponse.json(
      { error: "Unable to deactivate plan right now." },
      { status: 500 }
    )
  }
}
