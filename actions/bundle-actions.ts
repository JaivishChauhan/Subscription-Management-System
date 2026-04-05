"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import type { BundleFormData } from "@/types/bundle"

/** @throws If session is missing or user is not admin */
async function requireAdmin(): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required")
  }
}

/**
 * Creates a new bundle with its service associations.
 * @security Admin-only.
 */
export async function createBundleAction(data: BundleFormData) {
  await requireAdmin()

  const bundle = await prisma.bundle.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      type: data.type,
      discountType: data.discountType,
      discountValue: data.discountValue,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      services: {
        create: data.serviceIds.map((serviceId, order) => ({
          serviceId,
          order,
        })),
      },
    },
    include: { services: { include: { service: true } } },
  })

  revalidatePath("/admin/bundles")
  revalidatePath("/shop")
  revalidatePath("/")
  return bundle
}

/**
 * Updates a bundle. If serviceIds provided, atomically replaces all associations.
 * @security Admin-only.
 */
export async function updateBundleAction(
  id: string,
  data: Partial<BundleFormData>
) {
  await requireAdmin()

  // Atomically replace services if provided
  if (data.serviceIds !== undefined) {
    await prisma.bundleService.deleteMany({ where: { bundleId: id } })
  }

  const bundle = await prisma.bundle.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.discountType !== undefined && {
        discountType: data.discountType,
      }),
      ...(data.discountValue !== undefined && {
        discountValue: data.discountValue,
      }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.serviceIds !== undefined && {
        services: {
          create: data.serviceIds.map((serviceId, order) => ({
            serviceId,
            order,
          })),
        },
      }),
    },
    include: { services: { include: { service: true } } },
  })

  revalidatePath("/admin/bundles")
  revalidatePath("/shop")
  revalidatePath("/")
  return bundle
}

/**
 * Soft-deletes a bundle (isActive = false).
 * @security Admin-only. Never hard-deletes per JAIVISH Rule 5.1.
 */
export async function deactivateBundleAction(id: string) {
  await requireAdmin()

  await prisma.bundle.update({ where: { id }, data: { isActive: false } })

  revalidatePath("/admin/bundles")
  revalidatePath("/shop")
}

/**
 * Toggles featured state on a bundle.
 * @security Admin-only.
 */
export async function toggleBundleFeaturedAction(
  id: string,
  isFeatured: boolean
) {
  await requireAdmin()

  await prisma.bundle.update({ where: { id }, data: { isFeatured } })

  revalidatePath("/admin/bundles")
  revalidatePath("/")
}
