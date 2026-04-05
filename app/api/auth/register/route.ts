import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hash } from "bcryptjs"
import { signupSchema } from "@/lib/validations/auth"
import type { Prisma } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { email, password, name } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    // 1. Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    // 2. Hash password
    const hashedPassword = await hash(password, 12)

    // 3. Create user + contact in a transaction
    const nameParts = name.trim().split(/\s+/)
    const firstName = nameParts[0] ?? ""
    const lastName = nameParts.slice(1).join(" ") ?? ""

    const newUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: name.trim(),
          password: hashedPassword,
          role: "portal",
        },
      })

      await tx.contact.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
        },
      })

      return user
    })

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/auth/register] error:", error)
    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    )
  }
}
