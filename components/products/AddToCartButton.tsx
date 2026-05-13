"use client";

import type { Product } from "@/lib/types";
import { useCartStore } from "@/shore/cartStore";


type AddToCartButtonProps = {
  product: Product;
  disabled?: boolean;
};

export default function AddToCartButton({
  product,
  disabled,
}: AddToCartButtonProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const defaultSize = product.sizes?.[0];

  return (
    <button
      onClick={() => {
        if (!defaultSize) {
          return;
        }

        addToCart(product, defaultSize);
      }}
      disabled={disabled || !defaultSize}
      className="bg-gray-900 rounded text-white py-4 hover:bg-gray-800 transition disabled:bg-gray-400 w-full"
    >
      Add to Cart
    </button>
  );
}
