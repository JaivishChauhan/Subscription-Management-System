import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAdminApi } from "@/lib/admin"
import { hash } from "bcryptjs"
import { adminUpdateUserSchema } from "@/lib/validations/user"

const BCRYPT_COST = 12

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/users/[id]
 * Returns a single user's profile (non-admin users only).
 * @security Admin-only.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { error } = await requireAdminApi()
  if (error) return error

  const { id } = await context.params

  const user = await prisma.user.findUnique({
    where: { id, role: { in: ["internal", "portal"] } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          company: true,
          address: true,
          city: true,
          state: true,
          country: true,
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 })
  }

  return NextResponse.json({ user })
}

/**
 * PATCH /api/users/[id]
 * Updates name, phone, role (internal ↔ portal), or password.
 * @security Admin-only. Cannot promote to admin role via this endpoint.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { error } = await requireAdminApi()
  if (error) return error

  const { id } = await context.params

  try {
    const body = await request.json()
    const parsed = adminUpdateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid user data." },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    })

    if (!existing || existing.role === "admin") {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    const { password, ...rest } = parsed.data
    const updateData: Record<string, unknown> = { ...rest }

    if (password) {
      updateData.password = await hash(password, BCRYPT_COST)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        updatedAt: true,
      },
    })

    revalidatePath("/admin/users")
    revalidatePath(`/admin/users/${id}`)

    return NextResponse.json({ user })
  } catch (err) {
    console.error("[USER_UPDATE_ERROR]", err)
    return NextResponse.json(
      { error: "Unable to update user right now." },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/[id]
 * Soft-deletes by deactivating — currently implemented as hard delete
 * since User has no `isActive` field. Uses Prisma cascade for cleanup.
 * @security Admin-only. Cannot delete another admin.
 * @warning This will cascade-delete Contact, Sessions, Subscriptions references.
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { error } = await requireAdminApi()
  if (error) return error

  const { id } = await context.params

  try {
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    })

    if (!existing || existing.role === "admin") {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    await prisma.user.delete({ where: { id } })

    revalidatePath("/admin/users")

    return NextResponse.json({ message: "User deleted successfully." })
  } catch (err) {
    console.error("[USER_DELETE_ERROR]", err)
    return NextResponse.json(
      { error: "Unable to delete user right now." },
      { status: 500 }
    )
  }
}
