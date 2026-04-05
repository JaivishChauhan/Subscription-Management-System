import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireApiRole } from "@/lib/admin"

export async function POST(request: Request) {
  try {
    const { error } = await requireApiRole(["admin", "internal"])
    if (error) return error

    const body = await request.json()
    const { name, validityDays, recurringPlanId, lines } = body

    if (!name || !validityDays || !recurringPlanId || !lines || lines.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const template = await prisma.quotationTemplate.create({
      data: {
        name,
        validityDays: Number(validityDays),
        recurringPlanId,
        lines: {
          create: lines.map((line: any) => ({
            productName: line.productName,
            description: line.description || "",
            quantity: Number(line.quantity),
            unitPrice: Number(line.unitPrice),
          })),
        },
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/quotations/templates] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
