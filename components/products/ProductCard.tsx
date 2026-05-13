"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useCartStore } from "@/shore/cartStore";
import { useWishlistStore } from "@/shore/wishlistStore";
import type { Product } from "@/lib/types";
import ProductGallery from "./ProductGallery";
import { useFeedbackStore } from "@/shore/feedbackStore";


type ProductCardProps = {
  product: Product;
  index?: number;
  rankingBadge?: string;
};

export default function ProductCard({
  product,
  index = 0,
  rankingBadge,
}: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const pushToast = useFeedbackStore((state) => state.pushToast);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);

  const handleQuickAdd = () => {
    if (product.stock === 0) {
      pushToast("This product is out of stock.");
      return;
    }

    const defaultSize = product.sizes?.[0];
    if (!defaultSize) {
      pushToast("Please choose a product with a size option.");
      return;
    }

    addToCart(product, defaultSize);
    pushToast(`${product.name} added to cart.`);
  };

  const handleWishlist = () => {
    if (isInWishlist) {
      removeFromWishlist(product.id);
      pushToast("Removed from wishlist.");
    } else {
      addToWishlist(product);
      pushToast("Added to wishlist.");
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
      },
    },
  };

  const imageVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
  };

  const buttonVariants = {
    rest: { opacity: 0, y: 10 },
    hover: { opacity: 1, y: 0 },
  };

  const ageLabelMap = {
    "0-6m": "0–6 months",
    "6-12m": "6–12 months",
    "1-2y": "1–2 years",
    "3-5y": "3–5 years",
    "6-10y": "6–10 years",
  } as const;

  const conditionLabelMap = {
    "like-new": "Like New",
    "gently-used": "Gently Used",
    used: "Used",
  } as const;

  const categoryLabelMap = {
    clothes: "Clothes",
    toys: "Toys",
    baby: "Baby Essentials",
    shoes: "Shoes",
    accessories: "Accessories",
  };

  const categoryLabel =
    categoryLabelMap[product.category as keyof typeof categoryLabelMap] ??
    product.category;

  const primaryAgeLabel = product.ageGroup[0]
    ? ageLabelMap[product.ageGroup[0]]
    : null;

  return (
    <motion.div
      className="group"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Product Image */}
      <motion.div
        className="relative overflow-hidden bg-gray-100"
        variants={imageVariants}
        initial="rest"
        whileHover="hover"
        transition={{ duration: 0.3 }}
      >
        <Link href={`/product/${product.id}`}>
          <ProductGallery
            images={product.images}
            productName={product.name}
          />
        </Link>

        {/* Badges (age group, condition) */}
        <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
          {rankingBadge && (
            <span className="rounded-full bg-amber-200 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-amber-900 shadow-sm backdrop-blur">
              {rankingBadge}
            </span>
          )}

          {primaryAgeLabel && (
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-sky-700 shadow-sm backdrop-blur">
              {primaryAgeLabel}
            </span>
          )}

          {product.condition && (
            <span
              className={
                "rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-sm backdrop-blur " +
                (product.condition === "like-new"
                  ? "bg-emerald-100 text-emerald-700"
                  : product.condition === "gently-used"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-700")
              }
            >
              {conditionLabelMap[product.condition]}
            </span>
          )}
        </div>

        {/* Wishlist Heart */}
        <motion.button
          onClick={handleWishlist}
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart
            size={20}
            className={isInWishlist ? "fill-red-500 text-red-500" : "text-gray-900"}
          />
        </motion.button>

        {/* Hover Button */}
        <motion.button
          type="button"
          onClick={handleQuickAdd}
          disabled={product.stock === 0}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 rounded text-white px-6 py-3 text-sm opacity-0 group-hover:opacity-100 transition disabled:bg-gray-500"
          variants={buttonVariants}
          transition={{ duration: 0.2 }}
        >
          Add to Cart
        </motion.button>
      </motion.div>

      {/* Product Info */}
      <motion.div
        className="mt-4 space-y-1"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <p className="text-sm text-gray-500">
          {categoryLabel}
        </p>

        <h3 className="font-medium text-base md:text-lg text-gray-900">
          {product.name}
        </h3>

        <p className="font-semibold text-gray-900">
          ₦{product.price.toLocaleString()}
        </p>
      </motion.div>
    </motion.div>
  );
}