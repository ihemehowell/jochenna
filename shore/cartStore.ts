import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../lib/types";
import {
  addCartItem,
  clearCartApi,
  getCart,
  removeCartItem,
  updateCartItem,
  type ApiCartItem,
} from "../lib/api";
import { useAuthStore } from "./authStore";

// Local CartItem uses Product and adds cart-specific fields
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
  syncCartFromServer: () => Promise<void>;
  addToCart: (product: Product, selectedSize: string) => Promise<void>;
  removeFromCart: (id: string, selectedSize: string) => Promise<void>;
  increaseQuantity: (id: string, selectedSize: string) => Promise<void>;
  decreaseQuantity: (id: string, selectedSize: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const isValidProductSelection = (
  product: Product | undefined,
  selectedSize: string
) => Boolean(product && selectedSize);

const isMatchingCartItem = (
  item: CartItem,
  id: string,
  selectedSize: string
) => item.id === id && item.selectedSize === selectedSize;

const getAuthToken = () => useAuthStore.getState().token;

const toLocalCartItems = (items: ApiCartItem[]): CartItem[] => items as CartItem[];

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

      syncCartFromServer: async () => {
        const token = getAuthToken();
        if (!token) {
          return;
        }

        const result = await getCart(token);
        if (result.ok) {
          set({ cart: toLocalCartItems(result.items) });
        }
      },

      addToCart: async (product: Product, selectedSize: string) => {
        if (!isValidProductSelection(product, selectedSize)) {
          return;
        }

        const nextCart = (() => {
          const existing = get().cart.find((item: CartItem) =>
            isMatchingCartItem(item, product.id, selectedSize)
          );

          if (existing) {
            return get().cart.map((item: CartItem) =>
              isMatchingCartItem(item, product.id, selectedSize)
                ? {
                    ...item,
                    quantity: item.quantity + 1,
                  }
                : item
            );
          }

          return [
            ...get().cart,
            {
              ...product,
              selectedSize,
              quantity: 1,
            },
          ];
        })();

        set({ cart: nextCart });

        const token = getAuthToken();
        if (!token) {
          return;
        }

        const result = await addCartItem(token, {
          productId: product.id,
          quantity: 1,
          size: selectedSize,
        });

        if (result.ok && result.items) {
          set({ cart: toLocalCartItems(result.items) });
        }
      },

      removeFromCart: async (id: string, selectedSize: string) => {
        const currentCart = get().cart;
        const itemIndex = currentCart.findIndex((item: CartItem) =>
          isMatchingCartItem(item, id, selectedSize)
        );

        if (itemIndex === -1) {
          return;
        }

        set({
          cart: currentCart.filter(
            (item: CartItem) => !isMatchingCartItem(item, id, selectedSize)
          ),
        });

        const token = getAuthToken();
        if (!token) {
          return;
        }

        const result = await removeCartItem(token, { itemIndex });
        if (result.ok && result.items) {
          set({ cart: toLocalCartItems(result.items) });
        }
      },

      increaseQuantity: async (id: string, selectedSize: string) => {
        const currentCart = get().cart;
        const itemIndex = currentCart.findIndex((item: CartItem) =>
          isMatchingCartItem(item, id, selectedSize)
        );

        if (itemIndex === -1) {
          return;
        }

        const nextCart = currentCart.map((item: CartItem) =>
          isMatchingCartItem(item, id, selectedSize)
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );

        set({ cart: nextCart });

        const token = getAuthToken();
        if (!token) {
          return;
        }

        const currentItem = currentCart[itemIndex];
        const result = await updateCartItem(token, {
          itemIndex,
          quantity: currentItem.quantity + 1,
        });

        if (result.ok && result.items) {
          set({ cart: toLocalCartItems(result.items) });
        }
      },

      decreaseQuantity: async (id: string, selectedSize: string) => {
        const currentCart = get().cart;
        const itemIndex = currentCart.findIndex((item: CartItem) =>
          isMatchingCartItem(item, id, selectedSize)
        );

        if (itemIndex === -1) {
          return;
        }

        const nextCart = currentCart
          .map((item: CartItem) =>
            isMatchingCartItem(item, id, selectedSize)
              ? {
                  ...item,
                  quantity: item.quantity - 1,
                }
              : item
          )
          .filter((item: CartItem) => item.quantity > 0);

        set({ cart: nextCart });

        const token = getAuthToken();
        if (!token) {
          return;
        }

        const currentItem = currentCart[itemIndex];
        const result = await updateCartItem(token, {
          itemIndex,
          quantity: Math.max(0, currentItem.quantity - 1),
        });

        if (result.ok && result.items) {
          set({ cart: toLocalCartItems(result.items) });
        }
      },

      clearCart: async () => {
        set({ cart: [] });
        const token = getAuthToken();
        if (!token) {
          return;
        }

        const result = await clearCartApi(token);
        if (result.ok && result.items) {
          set({ cart: toLocalCartItems(result.items) });
        }
      },
    }),
    {
      name: "jochenna-cart",
    }
  )
);
