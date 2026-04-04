import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BundleService {
  id: string;
  name: string;
  category: string;
  monthlyPrice: number;
  logoUrl: string | null;
}

interface BundleState {
  services: BundleService[];
  addService: (service: BundleService) => void;
  removeService: (id: string) => void;
  clearBundle: () => void;
  getTotalPrice: () => number;
  getDiscount: () => number;
  getFinalPrice: () => number;
}

// Progressive discount tiers
const getDiscountPercentage = (count: number): number => {
  if (count >= 10) return 25;
  if (count >= 7) return 20;
  if (count >= 5) return 15;
  if (count >= 3) return 10;
  return 0;
};

export const useBundleStore = create<BundleState>()(
  persist(
    (set, get) => ({
      services: [],
      
      addService: (service) =>
        set((state) => {
          // Check if service already exists
          if (state.services.find((s) => s.id === service.id)) {
            return state;
          }
          return { services: [...state.services, service] };
        }),
      
      removeService: (id) =>
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        })),
      
      clearBundle: () => set({ services: [] }),
      
      getTotalPrice: () => {
        const state = get();
        return state.services.reduce((sum, s) => sum + s.monthlyPrice, 0);
      },
      
      getDiscount: () => {
        const state = get();
        const count = state.services.length;
        const total = state.getTotalPrice();
        const discountPercent = getDiscountPercentage(count);
        return Math.round((total * discountPercent) / 100);
      },
      
      getFinalPrice: () => {
        const state = get();
        return state.getTotalPrice() - state.getDiscount();
      },
    }),
    {
      name: "bundle-storage",
    }
  )
);
