import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlanForm } from "../_components/PlanForm";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin";
import type { BillingPeriod } from "@/lib/validations/plan";

type PlanDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Plan",
};

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
  await requireAdminPage();

  const { id } = await params;
  const [plan, activeSubscriptionsCount] = await prisma.$transaction([
    prisma.recurringPlan.findUnique({
      where: { id },
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
    }),
    prisma.subscription.count({
      where: {
        recurringPlanId: id,
        status: "active",
      },
    }),
  ]);

  if (!plan) {
    notFound();
  }

  return (
    <PlanForm
      mode="edit"
      activeSubscriptionsCount={activeSubscriptionsCount}
      initialPlan={{
        ...plan,
        billingPeriod: normalizeBillingPeriod(plan.billingPeriod),
      }}
    />
  );
}

function normalizeBillingPeriod(value: string): BillingPeriod {
  switch (value) {
    case "daily":
    case "weekly":
    case "yearly":
      return value;
    default:
      return "monthly";
  }
}
