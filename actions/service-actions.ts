"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import type { ServiceFormData } from "@/types/service"

/** @throws If session is missing or user is not admin */
async function requireAdmin(): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required")
  }
}

/**
 * Creates a new marketplace service.
 * @security Admin-only — checked inside requireAdmin().
 */
export async function createServiceAction(data: ServiceFormData) {
  await requireAdmin()

  const service = await prisma.service.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      category: data.category,
      logoUrl: data.logoUrl ?? null,
      iconKey: data.iconKey ?? null,
      color: data.color,
      monthlyPrice: data.monthlyPrice,
      yearlyPrice: data.yearlyPrice ?? null,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
    },
  })

  revalidatePath("/admin/services")
  revalidatePath("/shop")
  revalidatePath("/")
  return service
}

/**
 * Updates an existing service by ID.
 * @security Admin-only.
 */
export async function updateServiceAction(
  id: string,
  data: Partial<ServiceFormData>
) {
  await requireAdmin()

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.iconKey !== undefined && { iconKey: data.iconKey }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.monthlyPrice !== undefined && {
        monthlyPrice: data.monthlyPrice,
      }),
      ...(data.yearlyPrice !== undefined && { yearlyPrice: data.yearlyPrice }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
    },
  })

  revalidatePath("/admin/services")
  revalidatePath("/shop")
  revalidatePath("/")
  return service
}

/**
 * Soft-deletes a service (sets isActive = false).
 * @security Admin-only. Never hard-deletes per JAIVISH Rule 5.1.
 */
export async function deactivateServiceAction(id: string) {
  await requireAdmin()

  await prisma.service.update({ where: { id }, data: { isActive: false } })

  revalidatePath("/admin/services")
  revalidatePath("/shop")
}

/**
 * Toggles the featured flag on a service.
 * @security Admin-only.
 */
export async function toggleServiceFeaturedAction(
  id: string,
  isFeatured: boolean
) {
  await requireAdmin()

  await prisma.service.update({ where: { id }, data: { isFeatured } })

  revalidatePath("/admin/services")
  revalidatePath("/")
}
