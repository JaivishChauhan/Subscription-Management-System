"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  IconArrowLeft,
  IconLoader2,
  IconReceiptTax,
  IconRefresh,
  IconShieldCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { taxCreateSchema, type TaxCreateInput, type TaxType } from "@/lib/validations/tax";

type TaxRecord = {
  id: string;
  name: string;
  type: TaxType;
  rate: number;
  description: string | null;
  isActive: boolean;
};

type TaxFormProps = {
  mode: "create" | "edit";
  initialTax?: TaxRecord;
};

type TaxFormInput = z.input<typeof taxCreateSchema>;

export function TaxForm({ mode, initialTax }: TaxFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const defaultValues = useMemo<TaxFormInput>(
    () => ({
      name: initialTax?.name ?? "",
      type: initialTax?.type ?? "percentage",
      rate: initialTax?.rate ?? 0,
      description: initialTax?.description ?? "",
      isActive: initialTax?.isActive ?? true,
    }),
    [initialTax],
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<TaxFormInput, unknown, TaxCreateInput>({
    resolver: zodResolver(taxCreateSchema),
    defaultValues,
  });

  const watchedType = watch("type") ?? "percentage";
  const watchedRate = watch("rate");
  const isEditing = mode === "edit" && initialTax;

  async function onSubmit(values: TaxCreateInput) {
    setIsSubmitting(true);

    try {
      const response = await fetch(isEditing ? `/api/taxes/${initialTax.id}` : "/api/taxes", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Unable to save the tax.");
        return;
      }

      toast.success(isEditing ? "Tax updated successfully." : "Tax created successfully.");

      const nextTaxId = isEditing ? initialTax.id : result.tax?.id;

      if (nextTaxId) {
        router.push(`/admin/taxes/${nextTaxId}`);
      } else {
        router.push("/admin/taxes");
      }

      router.refresh();
    } catch {
      toast.error("Something went wrong while saving the tax.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReactivate() {
    if (!initialTax) {
      return;
    }

    setIsReactivating(true);

    try {
      const response = await fetch(`/api/taxes/${initialTax.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Unable to reactivate tax.");
        return;
      }

      toast.success("Tax reactivated.");
      router.refresh();
    } catch {
      toast.error("Unable to reactivate tax right now.");
    } finally {
      setIsReactivating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/taxes"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to taxes
        </Link>

        {isEditing && !initialTax.isActive ? (
          <button
            type="button"
            onClick={handleReactivate}
            disabled={isReactivating}
            className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isReactivating ? "Reactivating..." : "Reactivate"}
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <section className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-indigo-600 uppercase">
              Tax Rule
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              {isEditing ? "Edit Tax" : "Create Tax Rule"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Taxes configured here become the source of truth for invoice generation and
              future subscription line calculations.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tax Name" error={errors.name?.message}>
              <input
                type="text"
                placeholder="GST 18%"
                className={inputClassName(Boolean(errors.name))}
                {...register("name")}
              />
            </Field>

            <Field label="Tax Type" error={errors.type?.message}>
              <select className={inputClassName(Boolean(errors.type))} {...register("type")}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </Field>

            <Field
              label={watchedType === "percentage" ? "Rate (%)" : "Fixed Amount"}
              error={errors.rate?.message}
            >
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClassName(Boolean(errors.rate))}
                {...register("rate", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <Field
            label="Description"
            error={errors.description?.message}
            hint="Optional note to explain where this tax applies or when it should be used."
          >
            <textarea
              rows={4}
              placeholder="Applicable to standard domestic invoices."
              className={inputClassName(Boolean(errors.description))}
              {...register("description")}
            />
          </Field>

          {isEditing ? (
            <label className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                {...register("isActive")}
              />
              <span>
                <span className="block text-sm font-semibold">Active tax rule</span>
                <span className="text-muted-foreground mt-1 block text-sm">
                  Disable this to keep history intact while preventing future use in invoice logic.
                </span>
              </span>
            </label>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gradient inline-flex min-w-36 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Create tax"
              )}
            </button>

            {isEditing ? (
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
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                <IconReceiptTax className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Preview</h2>
                <p className="text-muted-foreground text-sm">
                  Quick read of how this rule will appear in later billing flows.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-border bg-muted/20 p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Tax output
              </p>
              <p className="mt-2 text-2xl font-bold capitalize">{watchedType}</p>
              <p className="mt-4 text-3xl font-bold tracking-tight">
                {formatTaxPreview(watchedType, Number(watchedRate ?? 0))}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {watchedType === "percentage"
                  ? "Applied as a percentage of the taxable subtotal."
                  : "Applied as a fixed currency amount."}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <IconShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Usage Notes</h2>
                <p className="text-muted-foreground text-sm">
                  Keeping taxes explicit now simplifies invoice automation later.
                </p>
              </div>
            </div>

            <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
              <li>Inactive taxes remain in historical records but should be ignored for new invoices.</li>
              <li>Percentage taxes are capped at 100 to prevent invalid rule definitions.</li>
              <li>Future invoice generation can safely query active tax rules from this module.</li>
            </ul>
          </section>

          {isEditing && !initialTax.isActive ? (
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <IconRefresh className="mt-0.5 h-5 w-5 text-amber-700" />
                <div>
                  <h2 className="text-sm font-semibold text-amber-900">
                    This tax rule is currently inactive
                  </h2>
                  <p className="mt-1 text-sm text-amber-800">
                    You can still edit the record, or reactivate it when it should be available
                    for new invoice calculations again.
                  </p>
                </div>
              </div>
            </section>
          ) : null}
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground/90">{label}</label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function inputClassName(hasError: boolean) {
  return `w-full rounded-2xl border bg-background px-4 py-3 text-sm transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
    hasError ? "border-destructive" : "border-input"
  }`;
}

function formatTaxPreview(type: TaxType, value: number) {
  if (type === "percentage") {
    return `${value}%`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}
