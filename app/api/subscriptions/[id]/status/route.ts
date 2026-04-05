import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireApiRole } from "@/lib/admin"
import { generateInvoiceFromSubscription } from "@/lib/invoices"
import { canTransitionSubscriptionStatus } from "@/lib/subscriptions"
import { subscriptionStatusUpdateSchema } from "@/lib/validations/subscription"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { error, session } = await requireApiRole([
    "admin",
    "internal",
    "portal",
  ])
  if (error) {
    return error
  }

  try {
    const { id } = await context.params
    const body = await request.json()
    const parsed = subscriptionStatusUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid status update." },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        userId: true,
        recurringPlan: {
          select: {
            closable: true,
          },
        },
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found." },
        { status: 404 }
      )
    }

    if (session?.user?.role === "portal") {
      if (subscription.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Unauthorized access" },
          { status: 403 }
        )
      }
      // Portal user can only cancel active subscriptions
      if (parsed.data.status !== "closed") {
        return NextResponse.json(
          { error: "You can only cancel subscriptions." },
          { status: 403 }
        )
      }
    }

    const transition = canTransitionSubscriptionStatus({
      currentStatus: subscription.status as
        | "draft"
        | "quotation"
        | "confirmed"
        | "active"
        | "closed",
      nextStatus: parsed.data.status,
      closable: subscription.recurringPlan.closable,
    })

    if (!transition.ok) {
      return NextResponse.json({ error: transition.error }, { status: 400 })
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        status: parsed.data.status,
      },
      select: {
        id: true,
        subscriptionNumber: true,
        status: true,
      },
    })

    revalidatePath("/admin/subscriptions")
    revalidatePath(`/admin/subscriptions/${id}`)
    revalidatePath("/subscriptions")
    revalidatePath(`/subscriptions/${id}`)

    let invoice = null

    if (parsed.data.status === "active") {
      try {
        const generated = await generateInvoiceFromSubscription(id)
        invoice = generated.invoice
      } catch (invoiceError) {
        console.error("[INVOICE_GENERATION_ERROR]", invoiceError)
        return NextResponse.json(
          {
            error:
              "Subscription activated, but invoice generation failed. Please review the subscription lines and try again.",
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      subscription: updatedSubscription,
      invoice,
    })
  } catch (error) {
    console.error("[SUBSCRIPTION_STATUS_ERROR]", error)
    return NextResponse.json(
      { error: "Unable to update subscription status right now." },
      { status: 500 }
    )
  }
}
