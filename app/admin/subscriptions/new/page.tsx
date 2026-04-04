import type { Metadata } from "next";
import { SubscriptionForm } from "../_components/SubscriptionForm";
import { prisma } from "@/lib/db";
import { requirePageRole } from "@/lib/admin";

export const metadata: Metadata = {
  title: "New Subscription",
};

export default async function NewSubscriptionPage() {
  await requirePageRole(["admin", "internal"]);

  const [contacts, plans, paymentTerms, products, taxes] = await Promise.all([
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
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <SubscriptionForm
      mode="create"
      editable
      contacts={contacts.map((contact) => ({
        id: contact.id,
        name:
          [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim() ||
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
  );
}
