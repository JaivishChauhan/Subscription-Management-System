"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  IconArrowLeft,
  IconLoader2,
  IconPhoto,
  IconRefresh,
  IconShieldLock,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  productCreateSchema,
  type ProductCreateInput,
} from "@/lib/validations/product";

type ProductRecord = {
  id: string;
  name: string;
  type: "service" | "goods";
  salesPrice: number;
  costPrice: number;
  description: string | null;
  notes: string | null;
  image: string | null;
  isActive: boolean;
};

type ProductFormProps = {
  mode: "create" | "edit";
  initialProduct?: ProductRecord;
};

type ProductFormInput = z.input<typeof productCreateSchema>;

export function ProductForm({ mode, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const defaultValues = useMemo<ProductFormInput>(
    () => ({
      name: initialProduct?.name ?? "",
      type: initialProduct?.type ?? "service",
      salesPrice: initialProduct?.salesPrice ?? 0,
      costPrice: initialProduct?.costPrice ?? 0,
      description: initialProduct?.description ?? "",
      notes: initialProduct?.notes ?? "",
      image: initialProduct?.image ?? "",
      isActive: initialProduct?.isActive ?? true,
    }),
    [initialProduct],
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormInput, unknown, ProductCreateInput>({
    resolver: zodResolver(productCreateSchema),
    defaultValues,
  });

  const imageUrl = watch("image");
  const previewImageUrl = typeof imageUrl === "string" ? imageUrl : "";
  const isEditing = mode === "edit" && initialProduct;

  async function onSubmit(values: ProductCreateInput) {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        isEditing ? `/api/products/${initialProduct.id}` : "/api/products",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Unable to save the product.");
        return;
      }

      toast.success(
        isEditing ? "Product updated successfully." : "Product created successfully.",
      );

      const nextProductId = isEditing ? initialProduct.id : result.product?.id;

      if (nextProductId) {
        router.push(`/admin/products/${nextProductId}`);
      } else {
        router.push("/admin/products");
      }

      router.refresh();
    } catch {
      toast.error("Something went wrong while saving the product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate() {
    if (!initialProduct) {
      return;
    }

    const confirmed = window.confirm(
      "Deactivate this product? It will stay in history but stop appearing as active.",
    );

    if (!confirmed) {
      return;
    }

    setIsArchiving(true);

    try {
      const response = await fetch(`/api/products/${initialProduct.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Unable to deactivate product.");
        return;
      }

      toast.success("Product deactivated.");
      router.refresh();
    } catch {
      toast.error("Unable to deactivate product right now.");
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleReactivate() {
    if (!initialProduct) {
      return;
    }

    setIsReactivating(true);

    try {
      const response = await fetch(`/api/products/${initialProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Unable to reactivate product.");
        return;
      }

      toast.success("Product reactivated.");
      router.refresh();
    } catch {
      toast.error("Unable to reactivate product right now.");
    } finally {
      setIsReactivating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/products"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to products
        </Link>

        {isEditing ? (
          <div className="flex flex-wrap items-center gap-2">
            {initialProduct.isActive ? (
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
              Product Details
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              {isEditing ? "Edit Product" : "Create Product"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Capture the base catalog data first. Variants and recurring price overrides can
              layer on after this product exists.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Product Name" error={errors.name?.message}>
              <input
                type="text"
                placeholder="Enterprise Support"
                className={inputClassName(Boolean(errors.name))}
                {...register("name")}
              />
            </Field>

            <Field label="Product Type" error={errors.type?.message}>
              <select className={inputClassName(Boolean(errors.type))} {...register("type")}>
                <option value="service">Service</option>
                <option value="goods">Goods</option>
              </select>
            </Field>

            <Field label="Sales Price" error={errors.salesPrice?.message}>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClassName(Boolean(errors.salesPrice))}
                {...register("salesPrice", { valueAsNumber: true })}
              />
            </Field>

            <Field label="Cost Price" error={errors.costPrice?.message}>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClassName(Boolean(errors.costPrice))}
                {...register("costPrice", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <Field
            label="Description"
            error={errors.description?.message}
            hint="Shown in product detail and future sales flows."
          >
            <textarea
              rows={4}
              placeholder="Short summary of what this product covers."
              className={inputClassName(Boolean(errors.description))}
              {...register("description")}
            />
          </Field>

          <Field
            label="Internal Notes"
            error={errors.notes?.message}
            hint="Useful for delivery constraints, reminders, or fulfillment notes."
          >
            <textarea
              rows={4}
              placeholder="Internal-only notes"
              className={inputClassName(Boolean(errors.notes))}
              {...register("notes")}
            />
          </Field>

          <Field
            label="Image URL"
            error={errors.image?.message}
            hint="This first pass accepts a hosted image URL so the catalog is usable immediately."
          >
            <input
              type="url"
              placeholder="https://example.com/product-image.png"
              className={inputClassName(Boolean(errors.image))}
              {...register("image")}
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
                <span className="block text-sm font-semibold">Active product</span>
                <span className="text-muted-foreground mt-1 block text-sm">
                  Disable this to remove it from active catalog views without losing billing
                  history.
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
                "Create product"
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
                <IconPhoto className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Preview</h2>
                <p className="text-muted-foreground text-sm">
                  Quick visual check for the catalog card.
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-3xl border border-dashed border-border bg-muted/30">
              {previewImageUrl ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={previewImageUrl}
                    alt="Product preview"
                    fill
                    sizes="(max-width: 1024px) 100vw, 360px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 px-6 text-center">
                  <IconPhoto className="text-muted-foreground h-8 w-8" />
                  <p className="text-sm font-medium">No image preview yet</p>
                  <p className="text-muted-foreground text-sm">
                    Add an image URL to show a live preview here.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <IconShieldLock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">Lifecycle Notes</h2>
                <p className="text-muted-foreground text-sm">
                  This module uses soft deactivation to preserve billing history.
                </p>
              </div>
            </div>

            <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
              <li>Products remain referenced by subscriptions and invoices after deactivation.</li>
              <li>Recurring plan pricing overrides can be added once the base catalog is in place.</li>
              <li>Variants are intentionally separate so this form stays lightweight.</li>
            </ul>
          </section>

          {isEditing && !initialProduct.isActive ? (
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <IconRefresh className="mt-0.5 h-5 w-5 text-amber-700" />
                <div>
                  <h2 className="text-sm font-semibold text-amber-900">
                    This product is currently inactive
                  </h2>
                  <p className="mt-1 text-sm text-amber-800">
                    You can still edit the record, or reactivate it when it should return to the
                    active catalog.
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
