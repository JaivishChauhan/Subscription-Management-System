import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAdminApi } from "@/lib/admin"
import { taxUpdateSchema } from "@/lib/validations/tax"

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
    const parsed = taxUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid tax data." },
        { status: 400 }
      )
    }

    const existingTax = await prisma.tax.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existingTax) {
      return NextResponse.json({ error: "Tax not found." }, { status: 404 })
    }

    const tax = await prisma.tax.update({
      where: { id },
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
    revalidatePath(`/admin/taxes/${id}`)

    return NextResponse.json({ tax })
  } catch (error) {
    console.error("[TAX_UPDATE_ERROR]", error)
    return NextResponse.json(
      { error: "Unable to update tax right now." },
      { status: 500 }
    )
  }
}
