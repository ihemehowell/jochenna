import { create } from "zustand";

import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      isCartOpen: false,

      openCart: () =>
        set({ isCartOpen: true }),

      closeCart: () =>
        set({ isCartOpen: false }),

      toggleCart: () =>
        set((state) => ({
          isCartOpen: !state.isCartOpen,
        })),

      addToCart: (product, selectedSize) => {
        const existing = get().cart.find(
          (item) =>
            item.id === product.id &&
            item.selectedSize === selectedSize
        );

        if (existing) {
          set({
            cart: get().cart.map((item) =>
              item.id === product.id &&
              item.selectedSize === selectedSize
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                  }
                : item
            ),
          });
        } else {
          set({
            cart: [
              ...get().cart,
              {
                ...product,
                selectedSize,
                quantity: 1,
              },
            ],
          });
        }

        set({ isCartOpen: true });
      },

      removeFromCart: (id, selectedSize) => {
        set({
          cart: get().cart.filter(
            (item) =>
              !(
                item.id === id &&
                item.selectedSize === selectedSize
              )
          ),
        });
      },

      increaseQuantity: (
        id,
        selectedSize
      ) => {
        set({
          cart: get().cart.map((item) =>
            item.id === id &&
            item.selectedSize === selectedSize
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          ),
        });
      },

      decreaseQuantity: (
        id,
        selectedSize
      ) => {
        set({
          cart: get()
            .cart.map((item) =>
              item.id === id &&
              item.selectedSize === selectedSize
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item
            )
            .filter((item) => item.quantity > 0),
        });
      },

      clearCart: () => set({ cart: [] }),
    }),

    {
      name: "jochenna-cart",
    }
  )
);