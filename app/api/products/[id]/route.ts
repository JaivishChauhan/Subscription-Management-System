import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin";
import { productUpdateSchema } from "@/lib/validations/product";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) {
    return error;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid product data." },
        { status: 400 },
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        type: true,
        salesPrice: true,
        costPrice: true,
        description: true,
        notes: true,
        image: true,
        isActive: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);

    return NextResponse.json({ product });
  } catch (error) {
    console.error("[PRODUCT_UPDATE_ERROR]", error);
    return NextResponse.json(
      { error: "Unable to update product right now." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { error } = await requireAdminApi();
  if (error) {
    return error;
  }

  try {
    const { id } = await context.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        isActive: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);

    return NextResponse.json({
      message: "Product deactivated successfully.",
      product,
    });
  } catch (error) {
    console.error("[PRODUCT_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: "Unable to deactivate product right now." },
      { status: 500 },
    );
  }
}
