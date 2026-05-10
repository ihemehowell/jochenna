"use client";

import Link from "next/link";
import { useCartStore, type Product } from "@/shore/cartStore";
import ProductGallery from "./ProductGallery";
import { useFeedbackStore } from "@/shore/feedbackStore";


type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const addToCart = useCartStore.getState().addToCart;
  const pushToast = useFeedbackStore((state) => state.pushToast);

  const handleQuickAdd = () => {
    if (product.stock === 0) {
      pushToast("This product is out of stock.");
      return;
    }

    const defaultSize = product.sizes[0];
    if (!defaultSize) {
      pushToast("Please choose a product with a size option.");
      return;
    }

    addToCart(product, defaultSize);
    pushToast(`${product.name} added to cart.`);
  };

  return (
    <div className="group">
      
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100">
        <Link href={`/product/${product.id}`}>
          <ProductGallery
            images={product.images}
            productName={product.name}
          />
        </Link>

        {/* Hover Button */}
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={product.stock === 0}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 rounded text-white px-6 py-3 text-sm opacity-0 group-hover:opacity-100 transition disabled:bg-gray-500"
        >
          Add to Cart
        </button>
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