import type { Metadata } from "next";
import { PlanForm } from "../_components/PlanForm";
import { requireAdminPage } from "@/lib/admin";

export const metadata: Metadata = {
  title: "New Plan",
};

export default async function NewPlanPage() {
  await requireAdminPage();

  return <PlanForm mode="create" />;
}
