import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin";

/**
 * GET /api/services
 * Public — returns all active services.
 * Supports ?category=streaming and ?featured=true query params.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured") === "true";
  const search = searchParams.get("q")?.trim();

  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        ...(featured ? { isFeatured: true } : {}),
        ...(search
          ? { name: { contains: search, mode: "insensitive" } }
          : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(services);
  } catch (err) {
    console.error("[GET /api/services]", err);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

/**
 * POST /api/services
 * @security Admin-only. Role verified server-side.
 */
export async function POST(req: NextRequest) {
  const { error } = await requireAdminApi();
  if (error) {
    return error;
  }

  try {
    const body = await req.json();

    if (!body.name || !body.slug || !body.category || body.monthlyPrice == null) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug, category, monthlyPrice" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description ?? null,
        category: body.category,
        logoUrl: body.logoUrl ?? null,
        iconKey: body.iconKey ?? null,
        color: body.color ?? "#6366f1",
        monthlyPrice: Number(body.monthlyPrice),
        yearlyPrice: body.yearlyPrice ? Number(body.yearlyPrice) : null,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    console.error("[POST /api/services]", err);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
