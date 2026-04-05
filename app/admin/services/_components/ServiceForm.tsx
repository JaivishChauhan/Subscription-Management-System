"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  IconArrowLeft,
  IconLoader2,
  IconCheck,
  IconColorPicker,
} from "@tabler/icons-react"
import { toast } from "sonner"

import {
  createServiceAction,
  updateServiceAction,
} from "@/actions/service-actions"
import {
  SERVICE_CATEGORIES,
  type ServiceCategory,
  type ServiceDTO,
  type ServiceFormData,
} from "@/types/service"

// We define the Zod schema inline for validation
const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  category: z.enum([
    "streaming",
    "productivity",
    "ai",
    "music",
    "gaming",
    "creative",
    "cloud",
    "communication",
    "security",
    "fitness",
  ]),
  logoUrl: z.union([z.string().url(), z.literal("")]).optional(),
  iconKey: z.string().optional(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color"),
  monthlyPrice: z.coerce.number().min(0, "Price cannot be negative"),
  yearlyPrice: z.coerce.number().min(0).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})

type ServiceFormProps = {
  mode: "create" | "edit"
  initialData?: ServiceDTO | null
}

export function ServiceForm({ mode, initialData }: ServiceFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const isEditing = mode === "edit" && initialData

  const defaultValues = useMemo<Partial<ServiceFormData>>(() => {
    return {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      category: initialData?.category ?? "streaming",
      logoUrl: initialData?.logoUrl ?? "",
      iconKey: initialData?.iconKey ?? "",
      color: initialData?.color ?? "#6366f1",
      monthlyPrice: initialData?.monthlyPrice ?? 0,
      yearlyPrice: initialData?.yearlyPrice ?? undefined,
      isActive: initialData?.isActive ?? true,
      isFeatured: initialData?.isFeatured ?? false,
    }
  }, [initialData])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema as any),
    defaultValues: defaultValues as ServiceFormData,
  })

  const watchedColor = watch("color")

  async function onSubmit(data: ServiceFormData) {
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateServiceAction(initialData.id, data)
          toast.success("Service updated successfully.")
        } else {
          await createServiceAction(data)
          toast.success("Service created successfully.")
        }
        router.push("/admin/services")
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error("Something went wrong while saving the service.")
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/services"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to services
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Service Name <span className="text-destructive">*</span>
              </label>
              <input
                {...register("name")}
                className="bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g. Netflix"
              />
              {errors.name && (
                <p className="text-destructive text-sm font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Slug <span className="text-destructive">*</span>
              </label>
              <input
                {...register("slug")}
                className="bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g. netflix"
              />
              {errors.slug && (
                <p className="text-destructive text-sm font-medium">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...register("description")}
                className="bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Brief description of the service..."
              />
              {errors.description && (
                <p className="text-destructive text-sm font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                {...register("category")}
                className="bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-destructive text-sm font-medium">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                Brand Color <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  {...register("color")}
                  className="h-10 w-12 cursor-pointer rounded-md border"
                />
                <input
                  type="text"
                  {...register("color")}
                  className="bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm uppercase focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="#6366F1"
                />
              </div>
              {errors.color && (
                <p className="text-destructive text-sm font-medium">
                  {errors.color.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Logo URL</label>
              <input
                {...register("logoUrl")}
                type="url"
                className="bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="https://..."
              />
              {errors.logoUrl && (
                <p className="text-destructive text-sm font-medium">
                  {errors.logoUrl.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tabler Icon Key</label>
              <input
                {...register("iconKey")}
                className="bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g. IconBrandNetflix"
              />
              {errors.iconKey && (
                <p className="text-destructive text-sm font-medium">
                  {errors.iconKey.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Monthly Price (₹) <span className="text-destructive">*</span>
              </label>
              <input
                {...register("monthlyPrice", { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                className="bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.monthlyPrice && (
                <p className="text-destructive text-sm font-medium">
                  {errors.monthlyPrice.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Yearly Price (₹)</label>
              <input
                {...register("yearlyPrice", { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                className="bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.yearlyPrice && (
                <p className="text-destructive text-sm font-medium">
                  {errors.yearlyPrice.message}
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                Leave blank if no yearly plan exists.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t pt-6 md:flex-row">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                {...register("isActive")}
                type="checkbox"
                className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
              />
              Active (Visible in Store)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                {...register("isFeatured")}
                type="checkbox"
                className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
              />
              Featured
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/services"
            className="hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border bg-transparent px-4 py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconCheck className="h-4 w-4" />
            )}
            {isEditing ? "Update Service" : "Create Service"}
          </button>
        </div>
      </form>
    </div>
  )
}
