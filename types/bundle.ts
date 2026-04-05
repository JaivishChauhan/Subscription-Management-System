import type { ServiceDTO } from "./service"

export type BundleType = "predefined" | "suggested" | "custom"
export type DiscountType = "percentage" | "fixed"

/**
 * DTO: bundle with included services and computed pricing.
 * originalPrice and finalPrice are computed, not stored in DB.
 */
export interface BundleDTO {
  id: string
  name: string
  slug: string
  description: string | null
  type: BundleType
  discountType: DiscountType
  discountValue: number
  isActive: boolean
  isFeatured: boolean
  services: ServiceDTO[]
  /** Computed: sum of all service monthly prices */
  originalPrice: number
  /** Computed: price after applying discountType + discountValue */
  finalPrice: number
}

/**
 * Form data for creating or editing a bundle in the admin panel.
 * @security Admin-only. serviceIds are validated against existing Service records server-side.
 */
export interface BundleFormData {
  name: string
  slug: string
  description?: string
  type: BundleType
  discountType: DiscountType
  discountValue: number
  isActive: boolean
  isFeatured: boolean
  serviceIds: string[]
}

/**
 * Auto-discount tiers for custom user bundles (bundle builder).
 * Applied automatically based on service count selected.
 * Sorted: highest tier first so find() returns the best applicable tier.
 */
export const BUNDLE_DISCOUNT_TIERS: {
  minServices: number
  discount: number
}[] = [
  { minServices: 8, discount: 30 },
  { minServices: 5, discount: 20 },
  { minServices: 3, discount: 10 },
  { minServices: 2, discount: 5 },
]

/**
 * Returns the highest applicable auto-discount percentage for a custom bundle.
 * @param count - Number of services selected
 * @returns Discount percentage (0 if less than 2 services)
 */
export function getCustomBundleDiscountPercent(count: number): number {
  return (
    BUNDLE_DISCOUNT_TIERS.find((t) => count >= t.minServices)?.discount ?? 0
  )
}

/**
 * Computes final price from original price, discount type, and value.
 * @security Cap discountValue at 0 to prevent negative prices.
 */
export function computeBundleFinalPrice(
  originalPrice: number,
  discountType: DiscountType,
  discountValue: number
): number {
  const safeDiscount = Math.max(0, discountValue)
  if (discountType === "percentage") {
    const pct = Math.min(safeDiscount, 100) / 100
    return Math.max(0, originalPrice * (1 - pct))
  }
  return Math.max(0, originalPrice - safeDiscount)
}
