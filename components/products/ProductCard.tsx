"use client";

import { useCartStore } from "@/shore/cartStore";
import Image from "next/image";
import Link from "next/link";
import ProductGallery from "./ProductGallery";


export default function ProductCard({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <div className="group">
      
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100">
        <Link href={`/product/${product.id}`}>
          <ProductGallery
            images={product.images}
            productName={product.name}
          />
        {/* Hover Button */}
        <button
          onClick={() => addToCart(product)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 rounded text-white px-6 py-3 text-sm opacity-0 group-hover:opacity-100 transition"
        >
          Add to Cart
        </button> 
        </Link>
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-1">
        <p className="text-sm text-gray-500">
          {product.category}
        </p>

        <h3 className="font-medium text-lg text-gray-900">
          {product.name}
        </h3>

        <p className="font-semibold text-gray-900">
          ₦{product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}