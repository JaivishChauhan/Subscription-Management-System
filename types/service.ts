/**
 * Service Category — the 10 available marketplace categories.
 * Maps to the `category` field on the Service model.
 */
export type ServiceCategory =
  | "streaming"
  | "productivity"
  | "ai"
  | "music"
  | "gaming"
  | "creative"
  | "cloud"
  | "communication"
  | "security"
  | "fitness"

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: "streaming", label: "Streaming" },
  { value: "productivity", label: "Productivity" },
  { value: "ai", label: "AI" },
  { value: "music", label: "Music" },
  { value: "gaming", label: "Gaming" },
  { value: "creative", label: "Creative" },
  { value: "cloud", label: "Cloud Storage" },
  { value: "communication", label: "Communication" },
  { value: "security", label: "Security" },
  { value: "fitness", label: "Fitness" },
]

/**
 * DTO: client-safe service record.
 * Never expose internal DB fields like updatedAt to client components.
 */
export interface ServiceDTO {
  id: string
  name: string
  slug: string
  description: string | null
  category: ServiceCategory
  logoUrl: string | null
  iconKey: string | null
  color: string
  monthlyPrice: number
  yearlyPrice: number | null
  isActive: boolean
  isFeatured: boolean
}

/**
 * Form data for creating or editing a service in the admin panel.
 * @security Validated server-side before DB write. Admin-only.
 */
export interface ServiceFormData {
  name: string
  slug: string
  description?: string
  category: ServiceCategory
  logoUrl?: string
  iconKey?: string
  color: string
  monthlyPrice: number
  yearlyPrice?: number
  isActive: boolean
  isFeatured: boolean
}
