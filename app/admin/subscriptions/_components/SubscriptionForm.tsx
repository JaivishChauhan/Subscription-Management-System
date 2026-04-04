"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  IconArrowLeft,
  IconInfoCircle,
  IconLoader2,
  IconPlus,
  IconReceipt2,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  calculateLineSubtotal,
  calculateTaxAmount,
  roundCurrency,
} from "@/lib/subscriptions";
import {
  subscriptionCreateSchema,
  type SubscriptionCreateInput,
  type SubscriptionStatus,
} from "@/lib/validations/subscription";
import { SubscriptionStatusBadge } from "./SubscriptionStatusBadge";

type ContactOption = {
  id: string;
  name: string;
  email: string;
  company: string | null;
};

type PlanOption = {
  id: string;
  name: string;
  billingPeriod: string;
  minQuantity: number;
  isActive: boolean;
};

type PaymentTermsOption = {
  id: string;
  name: string;
  dueDays: number;
};

type TaxOption = {
  id: string;
  name: string;
  type: "percentage" | "fixed";
  rate: number;
  isActive: boolean;
};

type ProductOption = {
  id: string;
  name: string;
  salesPrice: number;
  isActive: boolean;
  recurringPrices: Array<{
    recurringPlanId: string;
    price: number;
  }>;
  variants: Array<{
    id: string;
    attribute: string;
    value: string;
    extraPrice: number;
  }>;
};

type SubscriptionRecord = {
  id: string;
  subscriptionNumber: string;
  status: SubscriptionStatus;
  contactId: string;
  recurringPlanId: string;
  paymentTermsId: string | null;
  startDate: Date | null;
  expirationDate: Date | null;
  notes: string | null;
  lines: Array<{
    productId: string;
    variantId: string | null;
    quantity: number;
    unitPrice: number;
    taxAmount: number;
  }>;
};

type SubscriptionFormProps = {
  mode: "create" | "edit";
  editable: boolean;
  contacts: ContactOption[];
  plans: PlanOption[];
  paymentTerms: PaymentTermsOption[];
  products: ProductOption[];
  taxes: TaxOption[];
  initialSubscription?: SubscriptionRecord;
};

type SubscriptionFormInput = z.input<typeof subscriptionCreateSchema>;

const emptyLine = {
  productId: "",
  variantId: "",
  taxId: "",
  quantity: 1,
  unitPrice: 0,
  taxAmount: 0,
};

export function SubscriptionForm({
  mode,
  editable,
  contacts,
  plans,
  paymentTerms,
  products,
  taxes,
  initialSubscription,
}: SubscriptionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = useMemo<SubscriptionFormInput>(
    () => ({
      contactId: initialSubscription?.contactId ?? "",
      recurringPlanId: initialSubscription?.recurringPlanId ?? "",
      paymentTermsId: initialSubscription?.paymentTermsId ?? "",
      startDate: formatDateInput(initialSubscription?.startDate ?? null),
      expirationDate: formatDateInput(initialSubscription?.expirationDate ?? null),
      notes: initialSubscription?.notes ?? "",
      lines:
        initialSubscription?.lines.map((line) => ({
          productId: line.productId,
          variantId: line.variantId ?? "",
          taxId: "",
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxAmount: line.taxAmount,
        })) ?? [{ ...emptyLine }],
    }),
    [initialSubscription],
  );

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<SubscriptionFormInput, unknown, SubscriptionCreateInput>({
    resolver: zodResolver(subscriptionCreateSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const selectedPlanId = watch("recurringPlanId");
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const watchedLines = watch("lines");
  const totalQuantity = watchedLines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
  const subtotal = watchedLines.reduce(
    (sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0),
    0,
  );
  const taxTotal = watchedLines.reduce((sum, line) => sum + Number(line.taxAmount || 0), 0);
  const grandTotal = watchedLines.reduce(
    (sum, line) =>
      sum +
      calculateLineSubtotal({
        quantity: Number(line.quantity || 0),
        unitPrice: Number(line.unitPrice || 0),
        taxAmount: Number(line.taxAmount || 0),
      }),
    0,
  );
  const missingDependencies =
    contacts.length === 0 || plans.filter((plan) => plan.isActive).length === 0 || products.length === 0;

  async function onSubmit(values: SubscriptionCreateInput) {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        mode === "edit" && initialSubscription
          ? `/api/subscriptions/${initialSubscription.id}`
          : "/api/subscriptions",
        {
          method: mode === "edit" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Unable to save the subscription.");
        return;
      }

      toast.success(
        mode === "edit" ? "Subscription updated successfully." : "Subscription created successfully.",
      );

      const nextId = mode === "edit" ? initialSubscription?.id : result.subscription?.id;
      router.push(nextId ? `/admin/subscriptions/${nextId}` : "/admin/subscriptions");
      router.refresh();
    } catch {
      toast.error("Something went wrong while saving the subscription.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function applyProductDefaults(index: number, productId: string, variantId?: string) {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    const planPrice = product.recurringPrices.find(
      (price) => price.recurringPlanId === selectedPlanId,
    )?.price;
    const variantExtraPrice = variantId
      ? product.variants.find((variant) => variant.id === variantId)?.extraPrice ?? 0
      : 0;
    const nextUnitPrice = roundCurrency((planPrice ?? product.salesPrice) + variantExtraPrice);

    setValue(`lines.${index}.unitPrice`, nextUnitPrice, { shouldDirty: true });
    maybeRecalculateTax(index, nextUnitPrice);
  }

  function maybeRecalculateTax(index: number, nextUnitPrice?: number, nextQuantity?: number) {
    const line = watchedLines[index];
    if (!line?.taxId) {
      return;
    }

    const tax = taxes.find((item) => item.id === line.taxId);
    if (!tax) {
      return;
    }

    const resolvedTaxAmount = calculateTaxAmount({
      quantity: nextQuantity ?? Number(line.quantity || 0),
      unitPrice: nextUnitPrice ?? Number(line.unitPrice || 0),
      taxType: tax.type,
      taxRate: tax.rate,
    });

    setValue(`lines.${index}.taxAmount`, resolvedTaxAmount, { shouldDirty: true });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/subscriptions"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to subscriptions
        </Link>
        {initialSubscription ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{initialSubscription.subscriptionNumber}</span>
            <SubscriptionStatusBadge status={initialSubscription.status} />
          </div>
        ) : null}
      </div>

      {missingDependencies ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <IconInfoCircle className="mt-0.5 h-5 w-5 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                This flow needs customers, plans, and products before a subscription can be created.
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Make sure those foundation modules have usable data first.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1.4fr_0.95fr]">
        <section className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-indigo-600 uppercase">
              Subscription Setup
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              {mode === "edit" ? "Subscription Details" : "Create Subscription"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Draft and quotation subscriptions stay editable. Confirmed and active records become
              operationally read-only.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Customer" error={errors.contactId?.message}>
              <select
                disabled={!editable}
                className={inputClassName(Boolean(errors.contactId))}
                {...register("contactId")}
              >
                <option value="">Select customer</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name} {contact.company ? `- ${contact.company}` : ""} ({contact.email})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Plan" error={errors.recurringPlanId?.message}>
              <select
                disabled={!editable}
                className={inputClassName(Boolean(errors.recurringPlanId))}
                {...register("recurringPlanId")}
              >
                <option value="">Select plan</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} ({plan.billingPeriod}){!plan.isActive ? " - inactive" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Start Date" error={errors.startDate?.message}>
              <input
                type="date"
                disabled={!editable}
                className={inputClassName(Boolean(errors.startDate))}
                {...register("startDate")}
              />
            </Field>
            <Field label="Expiration Date" error={errors.expirationDate?.message}>
              <input
                type="date"
                disabled={!editable}
                className={inputClassName(Boolean(errors.expirationDate))}
                {...register("expirationDate")}
              />
            </Field>
            <Field label="Payment Terms" error={errors.paymentTermsId?.message}>
              <select
                disabled={!editable}
                className={inputClassName(Boolean(errors.paymentTermsId))}
                {...register("paymentTermsId")}
              >
                <option value="">Select payment terms</option>
                {paymentTerms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name} ({term.dueDays} day{term.dueDays === 1 ? "" : "s"})
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Notes" error={errors.notes?.message}>
            <textarea
              rows={4}
              disabled={!editable}
              placeholder="Internal notes for the subscription record."
              className={inputClassName(Boolean(errors.notes))}
              {...register("notes")}
            />
          </Field>

          <div className="space-y-4 rounded-3xl border border-border bg-muted/15 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Order Lines</h2>
                <p className="text-muted-foreground text-sm">
                  Products, quantity, optional tax rule, and stored tax amount per line.
                </p>
              </div>
              {editable ? (
                <button
                  type="button"
                  onClick={() => append({ ...emptyLine })}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-background"
                >
                  <IconPlus className="h-4 w-4" />
                  Add line
                </button>
              ) : null}
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const line = watchedLines[index];
                const selectedProduct = products.find((product) => product.id === line?.productId);
                const selectedTax = taxes.find((tax) => tax.id === line?.taxId);
                const lineErrors = errors.lines?.[index];

                return (
                  <div key={field.id} className="rounded-3xl border border-border bg-card p-4 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr_0.7fr_0.8fr_0.9fr_0.9fr_auto]">
                      <Field label="Product" error={lineErrors?.productId?.message}>
                        <select
                          disabled={!editable}
                          className={inputClassName(Boolean(lineErrors?.productId))}
                          {...register(`lines.${index}.productId`, {
                            onChange: (event) => {
                              setValue(`lines.${index}.variantId`, "", { shouldDirty: true });
                              applyProductDefaults(index, event.target.value);
                            },
                          })}
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}{!product.isActive ? " - inactive" : ""}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Variant" error={lineErrors?.variantId?.message}>
                        <select
                          disabled={!editable || !selectedProduct || selectedProduct.variants.length === 0}
                          className={inputClassName(Boolean(lineErrors?.variantId))}
                          {...register(`lines.${index}.variantId`, {
                            onChange: (event) => {
                              applyProductDefaults(index, line?.productId ?? "", event.target.value);
                            },
                          })}
                        >
                          <option value="">No variant</option>
                          {(selectedProduct?.variants ?? []).map((variant) => (
                            <option key={variant.id} value={variant.id}>
                              {variant.attribute}: {variant.value}
                              {variant.extraPrice ? ` (+${formatCurrency(variant.extraPrice)})` : ""}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Qty" error={lineErrors?.quantity?.message}>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          disabled={!editable}
                          className={inputClassName(Boolean(lineErrors?.quantity))}
                          {...register(`lines.${index}.quantity`, {
                            valueAsNumber: true,
                            onChange: (event) => {
                              maybeRecalculateTax(index, undefined, Number(event.target.value));
                            },
                          })}
                        />
                      </Field>
                      <Field label="Unit Price" error={lineErrors?.unitPrice?.message}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={!editable}
                          className={inputClassName(Boolean(lineErrors?.unitPrice))}
                          {...register(`lines.${index}.unitPrice`, {
                            valueAsNumber: true,
                            onChange: (event) => {
                              maybeRecalculateTax(index, Number(event.target.value));
                            },
                          })}
                        />
                      </Field>
                      <Field label="Tax Rule" error={lineErrors?.taxId?.message}>
                        <select
                          disabled={!editable}
                          className={inputClassName(Boolean(lineErrors?.taxId))}
                          {...register(`lines.${index}.taxId`, {
                            onChange: (event) => {
                              const nextTaxId = event.target.value;
                              if (!nextTaxId) {
                                return;
                              }
                              const tax = taxes.find((item) => item.id === nextTaxId);
                              if (!tax) {
                                return;
                              }
                              const resolvedTax = calculateTaxAmount({
                                quantity: Number(line?.quantity || 0),
                                unitPrice: Number(line?.unitPrice || 0),
                                taxType: tax.type,
                                taxRate: tax.rate,
                              });
                              setValue(`lines.${index}.taxAmount`, resolvedTax, { shouldDirty: true });
                            },
                          })}
                        >
                          <option value="">Manual tax</option>
                          {taxes.map((tax) => (
                            <option key={tax.id} value={tax.id}>
                              {tax.name}{!tax.isActive ? " - inactive" : ""}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Tax Amount" error={lineErrors?.taxAmount?.message}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={!editable || Boolean(selectedTax)}
                          className={inputClassName(Boolean(lineErrors?.taxAmount))}
                          {...register(`lines.${index}.taxAmount`, {
                            valueAsNumber: true,
                          })}
                        />
                      </Field>
                      <div className="flex items-end justify-end">
                        {editable ? (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-200 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                      <p className="text-muted-foreground">
                        Line total:{" "}
                        <span className="font-semibold text-foreground">
                          {formatCurrency(
                            calculateLineSubtotal({
                              quantity: Number(line?.quantity || 0),
                              unitPrice: Number(line?.unitPrice || 0),
                              taxAmount: Number(line?.taxAmount || 0),
                            }),
                          )}
                        </span>
                      </p>
                      <p className="text-muted-foreground">
                        {selectedTax
                          ? `Auto-calculated from ${selectedTax.name}`
                          : "Manual tax amount will be stored directly on this line."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {editable ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting || missingDependencies}
                className="btn-gradient inline-flex min-w-40 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : mode === "edit" ? (
                  "Save changes"
                ) : (
                  "Save as draft"
                )}
              </button>
              {mode === "edit" ? (
                <button
                  type="button"
                  onClick={() => reset(defaultValues)}
                  disabled={!isDirty || isSubmitting}
                  className="rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Discard
                </button>
              ) : null}
            </div>
          ) : null}
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                <IconReceipt2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Summary</h2>
                <p className="text-muted-foreground text-sm">Live totals based on the current draft.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <SummaryRow label="Line subtotal" value={formatCurrency(subtotal)} />
              <SummaryRow label="Tax total" value={formatCurrency(taxTotal)} />
              <SummaryRow label="Grand total" value={formatCurrency(grandTotal)} strong />
              <SummaryRow label="Total quantity" value={String(totalQuantity)} />
            </div>

            {selectedPlan ? (
              <div className="mt-5 rounded-2xl border border-border bg-muted/20 p-4 text-sm">
                <p className="font-semibold">Plan minimum quantity: {selectedPlan.minQuantity}</p>
                <p className="text-muted-foreground mt-1">
                  {totalQuantity < selectedPlan.minQuantity
                    ? "Current lines are below the required minimum quantity."
                    : "Current lines satisfy the plan minimum quantity."}
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <IconInfoCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Implementation Notes</h2>
                <p className="text-muted-foreground text-sm">Built against the current schema.</p>
              </div>
            </div>

            <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
              <li>Draft and quotation subscriptions can be edited; later states are read-only.</li>
              <li>Tax rules can auto-calculate line tax amounts, but the schema stores tax amounts rather than tax-rule relations.</li>
              <li>Activation is implemented as a status transition now; invoice generation lands next.</li>
            </ul>
          </section>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground/90">{label}</label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold" : "font-medium"}>{value}</span>
    </div>
  );
}

function inputClassName(hasError: boolean) {
  return `w-full rounded-2xl border bg-background px-4 py-3 text-sm transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70 ${
    hasError ? "border-destructive" : "border-input"
  }`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateInput(value: Date | null) {
  if (!value) {
    return "";
  }

  return value.toISOString().slice(0, 10);
}
