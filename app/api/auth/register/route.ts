import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validations/auth";

/**
 * POST /api/auth/register — Create a new portal user.
 *
 * @security
 * - Input validated via Zod (signupSchema).
 * - Password hashed with bcrypt (12 rounds).
 * - Returns 409 on duplicate email (no information leak — generic message).
 * - Auto-creates linked Contact record.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Generic message to prevent email enumeration
      return NextResponse.json(
        { error: "Unable to create account. Please try a different email." },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user + contact in a transaction
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "portal",
      },
    });

    // Create linked Contact record
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") || "";

    await prisma.contact.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        userId: user.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
