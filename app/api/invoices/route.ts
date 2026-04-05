import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireApiRole } from "@/lib/admin"
import { invoiceFiltersSchema } from "@/lib/validations/invoice"

export async function GET(request: NextRequest) {
  const { error, session } = await requireApiRole([
    "admin",
    "internal",
    "portal",
  ])
  if (error || !session?.user?.id) {
    return (
      error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    )
  }

  const searchParams = request.nextUrl.searchParams
  const parsed = invoiceFiltersSchema.safeParse({
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
    ...(session.user.role === "portal" ? { userId: session.user.id } : {}),
    ...(status === "all" ? {} : { status }),
    ...(q
      ? {
          OR: [
            { invoiceNumber: { contains: q, mode: "insensitive" as const } },
            {
              contact: {
                firstName: { contains: q, mode: "insensitive" as const },
              },
            },
            {
              contact: {
                lastName: { contains: q, mode: "insensitive" as const },
              },
            },
            {
              contact: {
                company: { contains: q, mode: "insensitive" as const },
              },
            },
            {
              contact: {
                user: { email: { contains: q, mode: "insensitive" as const } },
              },
            },
          ],
        }
      : {}),
  }

  const [total, invoices] = await prisma.$transaction([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        contact: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        subscription: {
          select: {
            subscriptionNumber: true,
          },
        },
        lines: {
          select: {
            name: true,
          },
        },
      },
    }),
  ])

  return NextResponse.json({
    invoices,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  })
}
