import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiRole } from "@/lib/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { error, session } = await requireApiRole(["admin", "internal", "portal"]);
  if (error || !session?.user?.id) {
    return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      contact: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      subscription: {
        include: {
          recurringPlan: {
            select: {
              name: true,
            },
          },
          paymentTerms: {
            select: {
              name: true,
              dueDays: true,
            },
          },
        },
      },
      lines: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  if (session.user.role === "portal" && invoice.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ invoice });
}
