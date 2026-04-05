"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { generateInvoiceFromSubscription } from "@/lib/invoices"

export async function createInvoiceAction(subscriptionId: string) {
  const session = await auth()
  if (!session || session.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required")
  }

  const result = await generateInvoiceFromSubscription(subscriptionId)

  revalidatePath("/admin/invoices")
  revalidatePath(`/admin/subscriptions/${subscriptionId}`)

  return result
}
