import { NextResponse } from "next/server"
import { renderToStream } from "@react-pdf/renderer"
import { requireApiRole } from "@/lib/admin"
import { prisma } from "@/lib/db"
import { InvoicePDF } from "@/components/InvoicePDF"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const roleCheck = await requireApiRole(["admin", "internal", "portal"])
  if (roleCheck.error) return roleCheck.error

  const { id } = await params

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      contact: {
        include: { user: { select: { email: true } } },
      },
      lines: { orderBy: { id: "asc" } },
    },
  })

  // Add the invoice numbers and logic that exist in our schema
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
  }

  try {
    const stream = await renderToStream(<InvoicePDF invoice={invoice} />)

    // We convert the Node.js Readable stream it returns to a Web stream.
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk))
        stream.on("end", () => controller.close())
        stream.on("error", (err) => controller.error(err))
      },
    })

    return new Response(readableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation failed:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
