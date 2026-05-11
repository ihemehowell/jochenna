import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./cartStore";

interface WishlistState {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string | number) => void;
  isInWishlist: (id: string | number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],

      addToWishlist: (product: Product) => {
        const exists = get().wishlist.some(
          (item) => item.id === product.id
        );
        if (!exists) {
          set({
            wishlist: [...get().wishlist, product],
          });
        }
      },

      removeFromWishlist: (id: string | number) => {
        set({
          wishlist: get().wishlist.filter((item) => item.id !== id),
        });
      },

      isInWishlist: (id: string | number) => {
        return get().wishlist.some((item) => item.id === id);
      },

      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: "jochenna-wishlist",
    }
  )
);
