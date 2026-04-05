import { CheckoutClient } from "./_components/CheckoutClient"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout | SubMS",
  description: "Secure checkout for Subscription Management System.",
}

export const dynamic = "force-dynamic"

export default async function CheckoutPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout")
  }

  return <CheckoutClient />
}
