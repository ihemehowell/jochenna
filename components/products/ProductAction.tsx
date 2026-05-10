"use client";

import { useCartStore } from "@/shore/cartStore";
import { useState } from "react";


export default function ProductActions({
  product,
}) {
  const [selectedSize, setSelectedSize] =
    useState("");

  const addToCart = useCartStore(
    (state) => state.addToCart
  );

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    addToCart(product, selectedSize);
  };

  return (
    <div className="space-y-8">
      
      {/* Sizes */}
      <div>
        <p className="font-medium mb-4 text-gray-800">
          Select Size
        </p>

        <div className="flex gap-3 flex-wrap">
          {product.sizes.map((size) => (
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

      {/* Add Button */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className="w-full bg-gray-800 rounded text-white py-4 hover:bg-gray-600 transition disabled:bg-gray-400"
      >
        Add to Cart
      </button>
    </div>
  );
}