"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCalendarTime,
  IconLoader2,
  IconRefresh,
  IconRepeat,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  recurringPlanCreateSchema,
  type BillingPeriod,
  type RecurringPlanCreateInput,
} from "@/lib/validations/plan";

type PlanRecord = {
  id: string;
  name: string;
  billingPeriod: BillingPeriod;
  price: number;
  minQuantity: number;
  startDate: Date | null;
  endDate: Date | null;
  autoClose: boolean;
  closable: boolean;
  pausable: boolean;
  renewable: boolean;
  isActive: boolean;
};

type PlanFormProps = {
  mode: "create" | "edit";
  initialPlan?: PlanRecord;
  activeSubscriptionsCount?: number;
};

type PlanFormInput = z.input<typeof recurringPlanCreateSchema>;

export function PlanForm({
  mode,
  initialPlan,
  activeSubscriptionsCount = 0,
}: PlanFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const defaultValues = useMemo<PlanFormInput>(
    () => ({
      name: initialPlan?.name ?? "",
      billingPeriod: initialPlan?.billingPeriod ?? "monthly",
      price: initialPlan?.price ?? 0,
      minQuantity: initialPlan?.minQuantity ?? 1,
      startDate: formatDateInput(initialPlan?.startDate ?? null),
      endDate: formatDateInput(initialPlan?.endDate ?? null),
      autoClose: initialPlan?.autoClose ?? false,
      closable: initialPlan?.closable ?? true,
      pausable: initialPlan?.pausable ?? false,
      renewable: initialPlan?.renewable ?? true,
      isActive: initialPlan?.isActive ?? true,
    }),
    [initialPlan],
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<PlanFormInput, unknown, RecurringPlanCreateInput>({
    resolver: zodResolver(recurringPlanCreateSchema),
    defaultValues,
  });

  const watchedBillingPeriod = watch("billingPeriod");
  const watchedPrice = watch("price");
  const billingPeriodLabel = watchedBillingPeriod ?? "monthly";
  const isEditing = mode === "edit" && initialPlan;

  async function onSubmit(values: RecurringPlanCreateInput) {
    setIsSubmitting(true);

    try {
      const response = await fetch(isEditing ? `/api/plans/${initialPlan.id}` : "/api/plans", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Unable to save the plan.");
        return;
      }

      toast.success(isEditing ? "Plan updated successfully." : "Plan created successfully.");

      const nextPlanId = isEditing ? initialPlan.id : result.plan?.id;

      if (nextPlanId) {
        router.push(`/admin/plans/${nextPlanId}`);
      } else {
        router.push("/admin/plans");
      }

      router.refresh();
    } catch {
      toast.error("Something went wrong while saving the plan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate() {
    if (!initialPlan) {
      return;
    }

    const confirmed = window.confirm(
      "Deactivate this plan? Existing records stay intact, but it will stop appearing as active.",
    );

    if (!confirmed) {
      return;
    }

    setIsArchiving(true);

    try {
      const response = await fetch(`/api/plans/${initialPlan.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Unable to deactivate plan.");
        return;
      }

      toast.success("Plan deactivated.");
      router.refresh();
    } catch {
      toast.error("Unable to deactivate plan right now.");
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleReactivate() {
    if (!initialPlan) {
      return;
    }

    setIsReactivating(true);

    try {
      const response = await fetch(`/api/plans/${initialPlan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Unable to reactivate plan.");
        return;
      }

      toast.success("Plan reactivated.");
      router.refresh();
    } catch {
      toast.error("Unable to reactivate plan right now.");
    } finally {
      setIsReactivating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/plans"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to plans
        </Link>

        {isEditing ? (
          <div className="flex flex-wrap items-center gap-2">
            {initialPlan.isActive ? (
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isArchiving}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isArchiving ? "Deactivating..." : "Deactivate"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReactivate}
                disabled={isReactivating}
                className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isReactivating ? "Reactivating..." : "Reactivate"}
              </button>
            )}
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <section className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-indigo-600 uppercase">
              Billing Configuration
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              {isEditing ? "Edit Plan" : "Create Recurring Plan"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Plans define cadence, pricing, and lifecycle options that subscriptions depend on.
            </p>
          </div>

          {isEditing && activeSubscriptionsCount > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <IconAlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    {activeSubscriptionsCount} active subscription
                    {activeSubscriptionsCount === 1 ? "" : "s"} depend on this plan
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    Pricing, dates, or option changes can affect ongoing business logic. Review
                    edits carefully before saving.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Plan Name" error={errors.name?.message}>
              <input
                type="text"
                placeholder="Growth Annual"
                className={inputClassName(Boolean(errors.name))}
                {...register("name")}
              />
            </Field>

            <Field label="Billing Period" error={errors.billingPeriod?.message}>
              <select
                className={inputClassName(Boolean(errors.billingPeriod))}
                {...register("billingPeriod")}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </Field>

            <Field label="Base Price" error={errors.price?.message}>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClassName(Boolean(errors.price))}
                {...register("price", { valueAsNumber: true })}
              />
            </Field>

            <Field label="Minimum Quantity" error={errors.minQuantity?.message}>
              <input
                type="number"
                min="1"
                step="1"
                className={inputClassName(Boolean(errors.minQuantity))}
                {...register("minQuantity", { valueAsNumber: true })}
              />
            </Field>

            <Field label="Start Date" error={errors.startDate?.message}>
              <input
                type="date"
                className={inputClassName(Boolean(errors.startDate))}
                {...register("startDate")}
              />
            </Field>

            <Field label="End Date" error={errors.endDate?.message}>
              <input
                type="date"
                className={inputClassName(Boolean(errors.endDate))}
                {...register("endDate")}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <CheckboxField
              title="Auto-close"
              description="Close subscriptions automatically when the plan end date is reached."
              registration={register("autoClose")}
            />
            <CheckboxField
              title="Closable"
              description="Allow manual closure of subscriptions linked to this plan."
              registration={register("closable")}
            />
            <CheckboxField
              title="Pausable"
              description="Allow subscriptions on this plan to be paused without closing."
              registration={register("pausable")}
            />
            <CheckboxField
              title="Renewable"
              description="Allow the subscription lifecycle to renew rather than naturally ending."
              registration={register("renewable")}
            />
          </div>

          {isEditing ? (
            <label className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                {...register("isActive")}
              />
              <span>
                <span className="block text-sm font-semibold">Active plan</span>
                <span className="text-muted-foreground mt-1 block text-sm">
                  Disable this to keep the plan in history while removing it from active admin
                  lists and future selection flows.
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
                "Create plan"
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
                <IconRepeat className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Plan Preview</h2>
                <p className="text-muted-foreground text-sm">
                  Sanity-check the commercial shape before saving.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-border bg-muted/20 p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Billing cadence
              </p>
              <p className="mt-2 text-2xl font-bold capitalize">{billingPeriodLabel}</p>
              <p className="mt-4 text-3xl font-bold tracking-tight">
                {formatCurrency(Number(watchedPrice ?? 0))}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Charged per {formatBillingUnit(billingPeriodLabel)}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <IconCalendarTime className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Lifecycle Notes</h2>
                <p className="text-muted-foreground text-sm">
                  These options directly shape subscription behavior later.
                </p>
              </div>
            </div>

            <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
              <li>Plans can be deactivated without deleting historical subscriptions.</li>
              <li>Product-specific recurring price overrides can be layered onto this plan later.</li>
              <li>Changing a live plan is higher risk than creating a new version for new sales.</li>
            </ul>
          </section>

          {isEditing && !initialPlan.isActive ? (
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <IconRefresh className="mt-0.5 h-5 w-5 text-amber-700" />
                <div>
                  <h2 className="text-sm font-semibold text-amber-900">
                    This plan is currently inactive
                  </h2>
                  <p className="mt-1 text-sm text-amber-800">
                    You can still edit the record, or reactivate it when it should be offered
                    again.
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

function CheckboxField({
  title,
  description,
  registration,
}: {
  title: string;
  description: string;
  registration: UseFormRegisterReturn;
}) {
  const { name, onBlur, onChange, ref } = registration;

  return (
    <label className="flex items-start gap-3 rounded-2xl border border-border bg-muted/20 p-4">
      <input
        type="checkbox"
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        ref={ref}
        className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="text-muted-foreground mt-1 block text-sm">{description}</span>
      </span>
    </label>
  );
}

function inputClassName(hasError: boolean) {
  return `w-full rounded-2xl border bg-background px-4 py-3 text-sm transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
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

function formatBillingUnit(period: BillingPeriod) {
  switch (period) {
    case "daily":
      return "day";
    case "weekly":
      return "week";
    case "yearly":
      return "year";
    default:
      return "month";
  }
}
