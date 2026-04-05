import { CartClient } from "./_components/CartClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Your Cart | SubMS",
  description: "Review your subscription plans and proceed to checkout.",
}

export default function CartPage() {
  return <CartClient />
}
