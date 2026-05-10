"use client";

import { useCartStore } from "@/shore/cartStore";



export default function AddToCartButton({
  product,
  disabled,
}) {
  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  return (
    <button
      onClick={() => addToCart(product)}
      disabled={disabled}
      className="bg-gray-900 rounded text-white py-4 hover:bg-gray-800 transition disabled:bg-gray-400 w-full"
    >
      Add to Cart
    </button>
  );
}