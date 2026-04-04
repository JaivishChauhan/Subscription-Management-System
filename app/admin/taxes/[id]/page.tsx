import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TaxForm } from "../_components/TaxForm";
import { prisma } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin";
import type { TaxType } from "@/lib/validations/tax";

type TaxDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit Tax",
};

export default async function TaxDetailPage({ params }: TaxDetailPageProps) {
  await requireAdminPage();

  const { id } = await params;
  const tax = await prisma.tax.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      type: true,
      rate: true,
      description: true,
      isActive: true,
    },
  });

  if (!tax) {
    notFound();
  }

  return (
    <TaxForm
      mode="edit"
      initialTax={{
        ...tax,
        type: normalizeTaxType(tax.type),
      }}
    />
  );
}

function normalizeTaxType(value: string): TaxType {
  return value === "fixed" ? "fixed" : "percentage";
}
