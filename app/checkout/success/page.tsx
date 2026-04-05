import { Suspense } from "react"
import { SuccessClient } from "./SuccessClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payment Successful | SubsMS",
  description: "Your payment was successful.",
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center p-4">
          Loading details...
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  )
}
