import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SubscriptionForm } from "@/app/admin/subscriptions/_components/SubscriptionForm"
import { SubscriptionStatusActions } from "@/app/admin/subscriptions/_components/SubscriptionStatusActions"
import { SubscriptionStatusBadge } from "@/app/admin/subscriptions/_components/SubscriptionStatusBadge"
import { prisma } from "@/lib/db"
import { requireInternalPage } from "@/lib/admin"
import type { SubscriptionStatus } from "@/lib/validations/subscription"

type SubscriptionDetailPageProps = {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Subscription Details",
}

export default async function InternalSubscriptionDetailPage({
  params,
}: SubscriptionDetailPageProps) {
  await requireInternalPage()

  const { id } = await params
  const [subscription, contacts, plans, paymentTerms, products, taxes] =
    await Promise.all([
      prisma.subscription.findUnique({
        where: { id },
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
          recurringPlan: true,
          paymentTerms: true,
          lines: {
            orderBy: { id: "asc" },
          },
        },
      }),
      prisma.contact.findMany({
        orderBy: [{ company: "asc" }, { firstName: "asc" }],
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
      prisma.recurringPlan.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.paymentTerms.findMany({
        orderBy: { dueDays: "asc" },
      }),
      prisma.product.findMany({
        orderBy: { name: "asc" },
        include: {
          variants: {
            orderBy: [{ attribute: "asc" }, { value: "asc" }],
          },
          recurringPrices: true,
        },
      }),
      prisma.tax.findMany({
        orderBy: { name: "asc" },
      }),
    ])

  if (!subscription) {
    notFound()
  }

  const status = normalizeSubscriptionStatus(subscription.status)
  const editable = status === "draft" || status === "quotation"

  return (
    <div className="space-y-6">
      <section className="border-border bg-card rounded-3xl border p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-sky-600 uppercase">
              Lifecycle Controls
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              {subscription.subscriptionNumber}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <SubscriptionStatusBadge status={status} />
              <p className="text-muted-foreground text-sm">
                Customer:{" "}
                {[subscription.contact.firstName, subscription.contact.lastName]
                  .filter(Boolean)
                  .join(" ")
                  .trim() ||
                  subscription.contact.company ||
                  "Customer"}
              </p>
            </div>
          </div>

          <SubscriptionStatusActions
            subscriptionId={subscription.id}
            status={status}
            closable={subscription.recurringPlan.closable}
          />
        </div>
      </section>

      <SubscriptionForm
        mode="edit"
        editable={editable}
        basePath="/internal"
        initialSubscription={{
          id: subscription.id,
          subscriptionNumber: subscription.subscriptionNumber,
          status,
          contactId: subscription.contactId,
          recurringPlanId: subscription.recurringPlanId,
          paymentTermsId: subscription.paymentTermsId,
          startDate: subscription.startDate,
          expirationDate: subscription.expirationDate,
          notes: subscription.notes,
          lines: subscription.lines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            taxAmount: line.taxAmount,
          })),
        }}
        contacts={contacts.map((contact) => ({
          id: contact.id,
          name:
            [contact.firstName, contact.lastName]
              .filter(Boolean)
              .join(" ")
              .trim() ||
            contact.company ||
            "Customer",
          email: contact.user.email,
          company: contact.company,
        }))}
        plans={plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          billingPeriod: plan.billingPeriod,
          minQuantity: plan.minQuantity,
          isActive: plan.isActive,
        }))}
        paymentTerms={paymentTerms.map((term) => ({
          id: term.id,
          name: term.name,
          dueDays: term.dueDays,
        }))}
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          salesPrice: product.salesPrice,
          isActive: product.isActive,
          recurringPrices: product.recurringPrices.map((price) => ({
            recurringPlanId: price.recurringPlanId,
            price: price.price,
          })),
          variants: product.variants.map((variant) => ({
            id: variant.id,
            attribute: variant.attribute,
            value: variant.value,
            extraPrice: variant.extraPrice,
          })),
        }))}
        taxes={taxes.map((tax) => ({
          id: tax.id,
          name: tax.name,
          type: tax.type === "fixed" ? "fixed" : "percentage",
          rate: tax.rate,
          isActive: tax.isActive,
        }))}
      />
    </div>
  )
}

function normalizeSubscriptionStatus(value: string): SubscriptionStatus {
  switch (value) {
    case "quotation":
    case "confirmed":
    case "active":
    case "closed":
      return value
    default:
      return "draft"
  }
}
