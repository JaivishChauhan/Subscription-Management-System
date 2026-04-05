import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireApiRole } from "@/lib/admin"
import { z } from "zod"

const paymentFiltersSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

const paymentCreateSchema = z.object({
  invoiceId: z.string().cuid("Valid invoice ID required"),
  paymentMethod: z.enum([
    "credit_card",
    "paypal",
    "bank_transfer",
    "cash",
    "stripe",
    "razorpay",
  ]),
  amount: z.number().positive("Payment amount must be positive"),
  paymentDate: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
})

/**
 * GET /api/payments
 * - admin/internal: returns all payments with invoice and creator details.
 * - portal: returns only payments for invoices linked to this user.
 * @security RBAC enforced — portal users see own data only.
 */
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
  const parsed = paymentFiltersSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid filters." },
      { status: 400 }
    )
  }

  const { q, page, pageSize } = parsed.data

  // Portal users see only their own invoice payments
  const portalWhere =
    session.user.role === "portal"
      ? { invoice: { userId: session.user.id } }
      : {}

  const where = {
    ...portalWhere,
    ...(q
      ? {
          OR: [
            {
              invoice: {
                invoiceNumber: { contains: q, mode: "insensitive" as const },
              },
            },
            {
              paymentMethod: { contains: q, mode: "insensitive" as const },
            },
          ],
        }
      : {}),
  }

  const [total, payments] = await prisma.$transaction([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { paymentDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            total: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ])

  return NextResponse.json({
    payments,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  })
}

/**
 * POST /api/payments
 * Records a payment against an invoice.
 * Admin and Internal users can create payments.
 * @security Admin + Internal only. Portal users cannot create payments.
 */
export async function POST(request: NextRequest) {
  const { error, session } = await requireApiRole(["admin", "internal"])
  if (error || !session?.user?.id) {
    return (
      error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    )
  }

  try {
    const body = await request.json()
    const parsed = paymentCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payment data." },
        { status: 400 }
      )
    }

    const { invoiceId, paymentMethod, amount, paymentDate, notes } = parsed.data

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        id: true,
        status: true,
        amountDue: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 })
    }

    if (invoice.status === "paid" || invoice.status === "cancelled") {
      return NextResponse.json(
        { error: `Cannot record payment on a ${invoice.status} invoice.` },
        { status: 400 }
      )
    }

    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          invoiceId,
          createdById: session.user.id,
          paymentMethod,
          amount,
          paymentDate: paymentDate ?? new Date(),
          notes,
        },
        include: {
          invoice: {
            select: { invoiceNumber: true, total: true },
          },
          createdBy: {
            select: { name: true, email: true },
          },
        },
      })

      // Mark invoice as paid if amount covers the full due amount
      if (amount >= invoice.amountDue) {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "paid",
            paidAt: paymentDate ?? new Date(),
            amountDue: 0,
          },
        })
      } else {
        // Reduce outstanding amount
        await tx.invoice.update({
          where: { id: invoiceId },
          data: { amountDue: Math.max(0, invoice.amountDue - amount) },
        })
      }

      return newPayment
    })

    revalidatePath("/admin/payments")
    revalidatePath("/internal/payments")
    revalidatePath(`/admin/invoices/${invoiceId}`)

    return NextResponse.json({ payment }, { status: 201 })
  } catch (err) {
    console.error("[PAYMENT_CREATE_ERROR]", err)
    return NextResponse.json(
      { error: "Unable to record payment right now." },
      { status: 500 }
    )
  }
}
