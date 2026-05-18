"use client";

import { useState } from "react";
import { useCartStore } from "@/shore/cartStore";
import type { Product } from "@/lib/types";
import { useFeedbackStore } from "@/shore/feedbackStore";


type ProductActionsProps = {
  product: Product;
};

export default function ProductActions({
  product,
}: ProductActionsProps) {
  const [selectedSize, setSelectedSize] =
    useState("");
  const [isAdding, setIsAdding] = useState(false);
  const hasSizes = (product.sizes?.length ?? 0) > 0;

  const addToCart = useCartStore((state) => state.addToCart);
  const pushToast = useFeedbackStore((state) => state.pushToast);

  const handleAddToCart = () => {
    if (product.stock === 0) {
      pushToast("This product is out of stock.");
      return;
    }

    if (hasSizes && !selectedSize) {
      pushToast("Please select a size first.");
      return;
    }

    setIsAdding(true);
    addToCart(product, selectedSize || "");
    pushToast(`${product.name} added to cart.`);
    setIsAdding(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Sizes */}
      {hasSizes ? (
        <div>
          <p className="font-medium mb-4 text-gray-800">
            Select Size
          </p>

          <div className="flex gap-3 flex-wrap">
            {product.sizes?.map((size: string) => (
              <button
                key={size}
                onClick={() =>
                  setSelectedSize(size)
                }
                className={`border px-5 py-3 transition ${
                  selectedSize === size
                    ? "bg-gray-800 text-white border-black"
                    : "border-gray-300 hover:border-gray-900 text-gray-500"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No size selection needed for this product.
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0 || (hasSizes && !selectedSize) || isAdding}
        className="w-full bg-gray-800 rounded text-white py-4 hover:bg-gray-600 transition disabled:bg-gray-400"
      >
        {product.stock === 0
          ? "Out of Stock"
          : isAdding
            ? "Adding..."
            : "Add to Cart"}
      </button>
    </div>
  );
}
