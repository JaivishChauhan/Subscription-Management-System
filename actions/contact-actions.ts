"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

async function requireAdmin(): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required")
  }
}

export async function updateContactAction(
  id: string,
  data: {
    firstName?: string
    lastName?: string
    company?: string | null
    phone?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    zip?: string | null
    country?: string | null
    notes?: string | null
  }
) {
  await requireAdmin()

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.company !== undefined && { company: data.company }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.state !== undefined && { state: data.state }),
      ...(data.zip !== undefined && { zip: data.zip }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  })

  revalidatePath("/admin/contacts")
  revalidatePath(`/admin/contacts/${id}`)
  return contact
}
