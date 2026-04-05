import { prisma } from "@/lib/db"
import type { SubscriptionStatus } from "@/lib/validations/subscription"
export * from "./validations/subscription-helpers"

export async function generateSubscriptionNumber(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const prefix = `SUB-${year}${month}${day}`

  const existingCount = await prisma.subscription.count({
    where: {
      subscriptionNumber: {
        startsWith: prefix,
      },
    },
  })

  return `${prefix}-${String(existingCount + 1).padStart(4, "0")}`
}
