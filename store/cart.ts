import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  plan:
    | "Daily"
    | "Weekly"
    | "Monthly"
    | "Quarterly"
    | "Yearly"
    | "Lifetime"
    | "One-time"
    | string
  type?: "plan" | "bundle"
  services?: string[] // For bundles
  discount?: number // Bundle discount percentage
}

export interface Discount {
  code: string
  type: "percent" | "fixed"
  value: number
}

interface CartState {
  items: CartItem[]
  discount: Discount | null
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  applyDiscount: (discount: Discount) => void
  removeDiscount: () => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      discount: null,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      applyDiscount: (discount) => set({ discount }),
      removeDiscount: () => set({ discount: null }),
      clearCart: () => set({ items: [], discount: null }),
    }),
    {
      name: "cart-storage",
    }
  )
)
