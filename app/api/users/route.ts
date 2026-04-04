import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAdminApi } from "@/lib/admin"
import { hash } from "bcryptjs"
import {
  adminCreateUserSchema,
  userFiltersSchema,
} from "@/lib/validations/user"

const BCRYPT_COST = 12

/**
 * GET /api/users
 * Lists internal and portal users (excluding admins for safety).
 * @security Admin-only. Admins cannot list or edit other admins via this route.
 */
export async function GET(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return error

  const searchParams = request.nextUrl.searchParams
  const parsed = userFiltersSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    role: searchParams.get("role") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid filters." },
      { status: 400 }
    )
  }

  const { q, role, page, pageSize } = parsed.data

  const where = {
    // Never expose other admin accounts via this endpoint
    role: role === "all" ? { in: ["internal", "portal"] } : role,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
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
            firstName: true,
            lastName: true,
            company: true,
          },
        },
      },
    }),
  ])

  return NextResponse.json({
    users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  })
}

/**
 * POST /api/users
 * Creates a new internal or portal user with a bcrypt-hashed password.
 * @security Admin-only. Role is validated — admins cannot create other admins.
 */
export async function POST(request: NextRequest) {
  const { error } = await requireAdminApi()
  if (error) return error

  try {
    const body = await request.json()
    const parsed = adminCreateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid user data." },
        { status: 400 }
      )
    }

    const { name, email, password, phone, role } = parsed.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      )
    }

    const hashedPassword = await hash(password, BCRYPT_COST)

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role,
          emailVerified: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
        },
      })

      // Auto-create a Contact record for CRM linkage
      const nameParts = name.trim().split(/\s+/)
      await tx.contact.create({
        data: {
          userId: newUser.id,
          firstName: nameParts[0] ?? "",
          lastName: nameParts.slice(1).join(" ") ?? "",
        },
      })

      return newUser
    })

    revalidatePath("/admin/users")

    return NextResponse.json({ user }, { status: 201 })
  } catch (err) {
    console.error("[USER_CREATE_ERROR]", err)
    return NextResponse.json(
      { error: "Unable to create user right now." },
      { status: 500 }
    )
  }
}
