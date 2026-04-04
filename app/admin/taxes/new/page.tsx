import type { Metadata } from "next";
import { TaxForm } from "../_components/TaxForm";
import { requireAdminPage } from "@/lib/admin";

export const metadata: Metadata = {
  title: "New Tax",
};

export default async function NewTaxPage() {
  await requireAdminPage();

  return <TaxForm mode="create" />;
}
