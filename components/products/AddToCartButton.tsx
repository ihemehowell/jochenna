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
  const defaultSize = product.sizes?.[0] ?? "";

  return (
    <button
      onClick={() => {
        addToCart(product, defaultSize);
      }}
      disabled={disabled}
      className="bg-ink rounded text-white py-4 hover:bg-ink transition disabled:bg-hairline w-full"
    >
      Add to Cart
    </button>
  );
}
