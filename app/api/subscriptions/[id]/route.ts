import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireApiRole } from "@/lib/admin"
import {
  calculateLineSubtotal,
  calculateTaxAmount,
  roundCurrency,
} from "@/lib/subscriptions"
import {
  subscriptionUpdateSchema,
  type SubscriptionCreateInput,
} from "@/lib/validations/subscription"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { error, session } = await requireApiRole(["admin", "internal"])
  if (error) {
    return error
  }

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const body = await request.json()
    const parsed = subscriptionUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ?? "Invalid subscription data.",
        },
        { status: 400 }
      )
    }

    const existingSubscription = await prisma.subscription.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        salespersonId: true,
      },
    })

    if (!existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found." },
        { status: 404 }
      )
    }

    if (
      existingSubscription.status !== "draft" &&
      existingSubscription.status !== "quotation"
    ) {
      return NextResponse.json(
        { error: "Only draft or quotation subscriptions can be edited." },
        { status: 400 }
      )
    }

    const prepared = await prepareSubscriptionWrite(parsed.data)

    if ("error" in prepared) {
      return NextResponse.json({ error: prepared.error }, { status: 400 })
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        contactId: prepared.contact.id,
        userId: prepared.contact.userId,
        salespersonId: existingSubscription.salespersonId ?? session.user.id,
        recurringPlanId: prepared.plan.id,
        paymentTermsId: prepared.paymentTermsId,
        startDate: parsed.data.startDate,
        expirationDate: parsed.data.expirationDate,
        notes: parsed.data.notes,
        lines: {
          deleteMany: {},
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
    revalidatePath(`/admin/subscriptions/${id}`)

    return NextResponse.json({ subscription })
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

    console.error("[SUBSCRIPTION_UPDATE_ERROR]", error)
    return NextResponse.json(
      { error: "Unable to update subscription right now." },
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
