"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  createPaymentAction,
  updatePaymentAction,
} from "@/actions/payment-actions"

interface InvoiceOption {
  id: string
  invoiceNumber: string
  amountDue: number
}

interface PaymentFormProps {
  id?: string
  initialData?: {
    invoiceId: string
    paymentMethod: string
    amount: number
    notes: string | null
    paymentDate: string
  }
  availableInvoices?: InvoiceOption[]
}

export function PaymentForm({
  id,
  initialData,
  availableInvoices = [],
}: PaymentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: initialData || {
      invoiceId: "",
      paymentMethod: "bank_transfer",
      amount: 0,
      notes: "",
      paymentDate: new Date().toISOString().substring(0, 10),
    },
  })

  async function onSubmit(data: any) {
    setIsSubmitting(true)
    try {
      if (id) {
        await updatePaymentAction(id, {
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          paymentDate: new Date(data.paymentDate),
        })
        toast.success("Payment record updated successfully")
      } else {
        await createPaymentAction({
          invoiceId: data.invoiceId,
          amount: parseFloat(data.amount),
          paymentMethod: data.paymentMethod,
          paymentDate: new Date(data.paymentDate),
          notes: data.notes,
        })
        toast.success("Payment recorded successfully")
      }
      router.push("/admin/payments")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error ? error.message : "Failed to save payment"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedInvoiceId = form.watch("invoiceId")
  const selectedInvoice = availableInvoices.find(
    (i) => i.id === selectedInvoiceId
  )

  // When creating a new payment, let's prepopulate the amount with the invoice's due amount
  const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    form.setValue("invoiceId", e.target.value)
    const inv = availableInvoices.find((i) => i.id === e.target.value)
    if (inv && !id) {
      form.setValue("amount", inv.amountDue as any)
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-2xl space-y-8"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="invoiceId" className="text-sm font-medium">
            Invoice
          </label>
          <select
            id="invoiceId"
            disabled={!!id}
            {...form.register("invoiceId")}
            onChange={handleInvoiceChange}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
          >
            <option value="" disabled>
              Selece an Invoice...
            </option>
            {availableInvoices.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.invoiceNumber} - Due: ${inv.amountDue}
              </option>
            ))}
          </select>
          {!id && selectedInvoice && (
            <p className="text-muted-foreground text-xs">
              Outstanding Balance: ${selectedInvoice.amountDue}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            disabled={!!id}
            {...form.register("amount", { required: true, min: 0.01 })}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="paymentMethod" className="text-sm font-medium">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            {...form.register("paymentMethod")}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="credit_card">Credit Card</option>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="stripe">Stripe</option>
            <option value="razorpay">Razorpay</option>
            <option value="paypal">PayPal</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="paymentDate" className="text-sm font-medium">
            Payment Date
          </label>
          <input
            id="paymentDate"
            type="date"
            {...form.register("paymentDate", { required: true })}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes / Reference
        </label>
        <textarea
          id="notes"
          {...form.register("notes")}
          placeholder="Txn ID, Check number, etc."
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        />
      </div>

      <div className="border-border flex gap-4 border-t pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-8 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : id
              ? "Update Payment"
              : "Record Payment"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-8 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
