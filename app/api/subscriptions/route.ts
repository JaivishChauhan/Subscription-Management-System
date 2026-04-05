import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireApiRole } from "@/lib/admin"
import {
  calculateLineSubtotal,
  calculateTaxAmount,
  generateSubscriptionNumber,
  roundCurrency,
} from "@/lib/subscriptions"
import {
  subscriptionCreateSchema,
  subscriptionFiltersSchema,
  type SubscriptionCreateInput,
} from "@/lib/validations/subscription"

export async function GET(request: NextRequest) {
  const { error } = await requireApiRole(["admin", "internal"])
  if (error) {
    return error
  }

  const searchParams = request.nextUrl.searchParams
  const parsed = subscriptionFiltersSchema.safeParse({
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
  const where = buildSubscriptionWhereClause({ q, status })

  const [total, subscriptions] = await prisma.$transaction([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      orderBy: { updatedAt: "desc" },
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
        recurringPlan: {
          select: {
            name: true,
            billingPeriod: true,
          },
        },
        lines: {
          select: {
            subtotal: true,
          },
        },
      },
    }),
  ])

  return NextResponse.json({
    subscriptions: subscriptions.map((subscription) => ({
      id: subscription.id,
      subscriptionNumber: subscription.subscriptionNumber,
      status: subscription.status,
      customerName: formatContactName(subscription.contact),
      customerEmail: subscription.contact.user.email,
      planName: subscription.recurringPlan.name,
      startDate: subscription.startDate,
      updatedAt: subscription.updatedAt,
      total: roundCurrency(
        subscription.lines.reduce((sum, line) => sum + line.subtotal, 0)
      ),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  })
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireApiRole(["admin", "internal"])
  if (error) {
    return error
  }

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = subscriptionCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ?? "Invalid subscription data.",
        },
        { status: 400 }
      )
    }

    const prepared = await prepareSubscriptionWrite(parsed.data)

    if ("error" in prepared) {
      return NextResponse.json({ error: prepared.error }, { status: 400 })
    }

    const subscription = await prisma.subscription.create({
      data: {
        subscriptionNumber: await generateSubscriptionNumber(),
        status: "draft",
        contactId: prepared.contact.id,
        userId: prepared.contact.userId,
        salespersonId: session.user.id,
        recurringPlanId: prepared.plan.id,
        paymentTermsId: prepared.paymentTermsId,
        startDate: parsed.data.startDate,
        expirationDate: parsed.data.expirationDate,
        notes: parsed.data.notes,
        lines: {
          create: prepared.lines,
        },
      },
      select: {
        id: true,
        subscriptionNumber: true,
        status: true,
      },
    })

    revalidatePath("/admin/subscriptions")
    revalidatePath(`/admin/subscriptions/${subscription.id}`)

    return NextResponse.json({ subscription }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith("PRODUCT_NOT_FOUND:")) {
        return NextResponse.json(
          { error: "One or more products were not found." },
          { status: 400 }
        )
      }

      if (error.message.startsWith("VARIANT_NOT_FOUND:")) {
        return NextResponse.json(
          { error: "Selected product variant was not found." },
          { status: 400 }
        )
      }

      if (error.message.startsWith("TAX_NOT_FOUND:")) {
        return NextResponse.json(
          { error: "Selected tax rule was not found." },
          { status: 400 }
        )
      }
    }

    console.error("[SUBSCRIPTION_CREATE_ERROR]", error)
    return NextResponse.json(
      { error: "Unable to create subscription right now." },
      { status: 500 }
    )
  }
}

async function prepareSubscriptionWrite(data: SubscriptionCreateInput) {
  const [contact, plan, paymentTerms, products, taxes] = await Promise.all([
    prisma.contact.findUnique({
      where: { id: data.contactId },
      select: {
        id: true,
        userId: true,
      },
    }),
    prisma.recurringPlan.findUnique({
      where: { id: data.recurringPlanId },
      select: {
        id: true,
        minQuantity: true,
      },
    }),
    data.paymentTermsId
      ? prisma.paymentTerms.findUnique({
          where: { id: data.paymentTermsId },
          select: { id: true },
        })
      : Promise.resolve(null),
    prisma.product.findMany({
      where: {
        id: {
          in: data.lines.map((line) => line.productId),
        },
      },
      select: {
        id: true,
        variants: {
          select: {
            id: true,
            productId: true,
          },
        },
      },
    }),
    prisma.tax.findMany({
      where: {
        id: {
          in: data.lines.flatMap((line) => (line.taxId ? [line.taxId] : [])),
        },
      },
      select: {
        id: true,
        type: true,
        rate: true,
      },
    }),
  ])

  if (!contact) {
    return { error: "Selected customer could not be found." } as const
  }

  if (!plan) {
    return { error: "Selected plan could not be found." } as const
  }

  if (data.paymentTermsId && !paymentTerms) {
    return { error: "Selected payment terms could not be found." } as const
  }

  const totalQuantity = data.lines.reduce((sum, line) => sum + line.quantity, 0)
  if (totalQuantity < plan.minQuantity) {
    return {
      error: `This plan requires a minimum quantity of ${plan.minQuantity}.`,
    } as const
  }

  const productMap = new Map(products.map((product) => [product.id, product]))
  const taxMap = new Map(taxes.map((tax) => [tax.id, tax]))

  const lines = data.lines.map((line) => {
    const product = productMap.get(line.productId)
    if (!product) {
      throw new Error(`PRODUCT_NOT_FOUND:${line.productId}`)
    }

    if (line.variantId) {
      const variant = product.variants.find(
        (item) => item.id === line.variantId
      )
      if (!variant) {
        throw new Error(`VARIANT_NOT_FOUND:${line.variantId}`)
      }
    }

    const resolvedTaxAmount = line.taxId
      ? (() => {
          const tax = taxMap.get(line.taxId)
          if (!tax) {
            throw new Error(`TAX_NOT_FOUND:${line.taxId}`)
          }

          return calculateTaxAmount({
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxType: tax.type,
            taxRate: tax.rate,
          })
        })()
      : roundCurrency(line.taxAmount)

    return {
      productId: line.productId,
      variantId: line.variantId,
      quantity: line.quantity,
      unitPrice: roundCurrency(line.unitPrice),
      taxAmount: resolvedTaxAmount,
      subtotal: calculateLineSubtotal({
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxAmount: resolvedTaxAmount,
      }),
    }
  })

  return {
    contact,
    plan,
    paymentTermsId: paymentTerms?.id,
    lines,
  } as const
}

function buildSubscriptionWhereClause({
  q,
  status,
}: {
  q?: string
  status: "all" | "draft" | "quotation" | "confirmed" | "active" | "closed"
}) {
  return {
    ...(status === "all" ? {} : { status }),
    ...(q
      ? {
          OR: [
            {
              subscriptionNumber: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              contact: {
                firstName: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              contact: {
                lastName: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              contact: {
                company: {
                  contains: q,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              contact: {
                user: {
                  email: {
                    contains: q,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          ],
        }
      : {}),
  }
}

function formatContactName(contact: {
  firstName: string
  lastName: string
  company: string | null
}) {
  const fullName = [contact.firstName, contact.lastName]
    .filter(Boolean)
    .join(" ")
    .trim()
  return fullName || contact.company || "Customer"
}
