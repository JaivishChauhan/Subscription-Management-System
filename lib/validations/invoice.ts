import { z } from "zod";

const invoiceStatusValues = ["draft", "confirmed", "paid", "cancelled"] as const;

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue === "" ? undefined : trimmedValue;
};

export const invoiceFiltersSchema = z.object({
  q: z.preprocess(
    emptyStringToUndefined,
    z.string().max(120, "Search query is too long.").optional(),
  ),
  status: z.enum(["all", ...invoiceStatusValues]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const invoiceStatusUpdateSchema = z.object({
  status: z.enum(invoiceStatusValues, {
    error: "Please choose a valid invoice status.",
  }),
});

export type InvoiceStatus = (typeof invoiceStatusValues)[number];
