import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireApiRole } from "@/lib/admin";
import { canTransitionInvoiceStatus } from "@/lib/invoices";
import { invoiceStatusUpdateSchema } from "@/lib/validations/invoice";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { error } = await requireApiRole(["admin", "internal"]);
  if (error) {
    return error;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = invoiceStatusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid invoice status." },
        { status: 400 },
      );
    }

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        total: true,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    const transition = canTransitionInvoiceStatus({
      currentStatus: existingInvoice.status,
      nextStatus: parsed.data.status,
    });

    if (!transition.ok) {
      return NextResponse.json({ error: transition.error }, { status: 400 });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: parsed.data.status,
        amountDue: parsed.data.status === "paid" ? 0 : existingInvoice.total,
        paidAt: parsed.data.status === "paid" ? new Date() : null,
      },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        amountDue: true,
      },
    });

    revalidatePath("/admin/invoices");
    revalidatePath(`/admin/invoices/${id}`);
    revalidatePath("/invoices");

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("[INVOICE_STATUS_ERROR]", error);
    return NextResponse.json(
      { error: "Unable to update invoice status right now." },
      { status: 500 },
    );
  }
}
