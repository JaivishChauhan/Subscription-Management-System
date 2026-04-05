"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import type { ServiceDTO } from "@/types/service"
import {
  createBundleAction,
  updateBundleAction,
} from "@/actions/bundle-actions"

const bundleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  type: z.enum(["predefined", "suggested", "custom"]),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0, "Must be >= 0"),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  serviceIds: z.array(z.string()).min(1, "Select at least one service"),
})

type BundleFormValues = z.infer<typeof bundleSchema>

interface BundleFormProps {
  initialData?: BundleFormValues & { id?: string }
  id?: string
  availableServices: ServiceDTO[]
}

export function BundleForm({
  initialData,
  id,
  availableServices,
}: BundleFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BundleFormValues>({
    resolver: zodResolver(bundleSchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      type: "predefined",
      discountType: "percentage",
      discountValue: 0,
      isActive: true,
      isFeatured: false,
      serviceIds: [],
    },
  })

  async function onSubmit(data: BundleFormValues) {
    setIsSubmitting(true)
    try {
      // Create or update via server action
      if (id) {
        await updateBundleAction(id, data)
        toast.success("Bundle updated successfully")
      } else {
        await createBundleAction(data)
        toast.success("Bundle created successfully")
      }

      router.push("/admin/bundles")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error ? error.message : "Failed to save bundle"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedType = form.watch("type")
  const selectedDiscountType = form.watch("discountType")
  const selectedServices = form.watch("serviceIds")

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-2xl space-y-8"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            {...form.register("name")}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            id="slug"
            {...form.register("slug")}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
          {form.formState.errors.slug && (
            <p className="text-sm text-red-500">
              {form.formState.errors.slug.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          {...form.register("description")}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            Type
          </label>
          <select
            id="type"
            {...form.register("type")}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="predefined">Predefined</option>
            <option value="suggested">Suggested</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="discountType" className="text-sm font-medium">
            Discount Type
          </label>
          <select
            id="discountType"
            {...form.register("discountType")}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="discountValue" className="text-sm font-medium">
            Discount Value{" "}
            {selectedDiscountType === "percentage" ? "(%)" : "($)"}
          </label>
          <input
            id="discountValue"
            type="number"
            min="0"
            step={selectedDiscountType === "fixed" ? "0.01" : "1"}
            max={selectedDiscountType === "percentage" ? "100" : undefined}
            {...form.register("discountValue", { valueAsNumber: true })}
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
          {form.formState.errors.discountValue && (
            <p className="text-sm text-red-500">
              {form.formState.errors.discountValue.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            {...form.register("isActive")}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label
            htmlFor="isActive"
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Active
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isFeatured"
            {...form.register("isFeatured")}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label
            htmlFor="isFeatured"
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Featured
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium">
          Services <span className="text-red-500">*</span>
        </label>
        <p className="text-muted-foreground text-xs">
          Select the services included in this bundle.
        </p>

        <div className="grid max-h-[300px] gap-4 overflow-y-auto rounded-md border p-4 sm:grid-cols-2">
          {availableServices.map((service) => {
            const isSelected = selectedServices.includes(service.id)
            return (
              <div
                key={service.id}
                className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-3 transition-colors ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/50"
                    : "border-border hover:bg-muted/50"
                }`}
                onClick={() => {
                  const current = form.getValues("serviceIds")
                  if (isSelected) {
                    form.setValue(
                      "serviceIds",
                      current.filter((id) => id !== service.id),
                      { shouldValidate: true }
                    )
                  } else {
                    form.setValue("serviceIds", [...current, service.id], {
                      shouldValidate: true,
                    })
                  }
                }}
              >
                <div className="flex h-5 items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // Handled by div click
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{service.name}</span>
                  <span className="text-muted-foreground text-xs">
                    ${service.monthlyPrice}/mo
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        {form.formState.errors.serviceIds && (
          <p className="text-sm text-red-500">
            {form.formState.errors.serviceIds.message}
          </p>
        )}
      </div>

      <div className="border-border flex gap-4 border-t pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-8 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : id ? "Update Bundle" : "Create Bundle"}
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
