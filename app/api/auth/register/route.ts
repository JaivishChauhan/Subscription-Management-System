import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validations/auth";

/**
 * POST /api/auth/register — No longer needed with Google OAuth.
 * This endpoint is deprecated. Users should sign in with Google.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Registration is handled via Google OAuth. Please use the sign-in button." },
    { status: 410 },
  );
}
