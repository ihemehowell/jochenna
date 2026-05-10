import { create } from "zustand";

import { persist } from "zustand/middleware";

interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  sizes: string[];
}

export type { Product };

interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

interface CartState {
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: Product, selectedSize: string) => void;
  removeFromCart: (id: number, selectedSize: string) => void;
  increaseQuantity: (id: number, selectedSize: string) => void;
  decreaseQuantity: (id: number, selectedSize: string) => void;
  clearCart: () => void;
}

const isValidProductSelection = (
  product: Product | undefined,
  selectedSize: string
) => Boolean(product && selectedSize);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      isCartOpen: false,

      openCart: () =>
        set({ isCartOpen: true }),

      closeCart: () =>
        set({ isCartOpen: false }),

      toggleCart: () =>
        set((state: CartState) => ({
          isCartOpen: !state.isCartOpen,
        })),

      addToCart: (product: Product, selectedSize: string) => {
        if (!isValidProductSelection(product, selectedSize)) {
          return;
        }

        const existing = get().cart.find(
          (item: CartItem) =>
            item.id === product.id &&
            item.selectedSize === selectedSize
        );

        if (existing) {
          set({
            cart: get().cart.map((item: CartItem) =>
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

      removeFromCart: (id: number, selectedSize: string) => {
        set({
          cart: get().cart.filter(
            (item: CartItem) =>
              !(
                item.id === id &&
                item.selectedSize === selectedSize
              )
          ),
        });
      },

      increaseQuantity: (
        id: number,
        selectedSize: string
      ) => {
        set({
          cart: get().cart.map((item: CartItem) =>
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
        id: number,
        selectedSize: string
      ) => {
        set({
          cart: get()
            .cart.map((item: CartItem) =>
              item.id === id &&
              item.selectedSize === selectedSize
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item
            )
            .filter((item: CartItem) => item.quantity > 0),
        });
      },

      clearCart: () => set({ cart: [] }),
    }),

    {
      name: "jochenna-cart",
    }
  )
);