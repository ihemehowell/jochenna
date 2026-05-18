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

    const defaultSize = product.sizes?.[0] ?? "";
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
      className="group h-full flex flex-col"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Product Image */}
      <motion.div
        className="relative overflow-hidden bg-gray-100 rounded-lg flex-1"
        variants={imageVariants}
        initial="rest"
        whileHover="hover"
        transition={{ duration: 0.3 }}
      >
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <ProductGallery
            images={product.images}
            productName={product.name}
          />
        </Link>

        {/* Badges (age group, condition) */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5 z-10 sm:left-4 sm:top-4 sm:gap-2">
          {rankingBadge && (
            <span className="rounded-full bg-amber-200 px-2 py-1 text-[10px] font-semibold tracking-wide text-amber-900 shadow-sm backdrop-blur sm:px-2.5 sm:py-1 sm:text-[11px]">
              {rankingBadge}
            </span>
          )}

          {primaryAgeLabel && (
            <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-semibold tracking-wide text-sky-700 shadow-sm backdrop-blur sm:px-2.5 sm:py-1 sm:text-[11px]">
              {primaryAgeLabel}
            </span>
          )}

          {product.condition && (
            <span
              className={
                "rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide shadow-sm backdrop-blur sm:px-2.5 sm:py-1 sm:text-[11px] " +
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
          className="absolute top-2 right-2 bg-white/95 rounded-full p-2 shadow-md hover:shadow-lg transition z-10 backdrop-blur sm:top-4 sm:right-4"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={20}
            className={isInWishlist ? "fill-red-500 text-red-500" : "text-gray-900"}
          />
        </motion.button>

        {/* Action Buttons - Always visible on mobile, hover on desktop */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-2 bg-linear-to-t from-black/40 to-transparent opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity sm:p-4 sm:gap-3">
          <motion.button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className="flex-1 bg-gray-900 rounded-lg text-white px-4 py-2 text-sm font-medium transition hover:bg-gray-800 disabled:bg-gray-500 disabled:cursor-not-allowed sm:rounded-full sm:py-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </motion.button>
          
          <Link href={`/product/${product.id}`} className="flex-1">
            <motion.button
              type="button"
              className="w-full bg-white rounded-lg text-gray-900 px-4 py-2 text-sm font-medium transition hover:bg-gray-50 sm:rounded-full sm:py-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              View
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Product Info */}
      <motion.div
        className="mt-3 space-y-1 sm:mt-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <p className="text-xs text-gray-500 uppercase tracking-wide sm:text-sm">
          {categoryLabel}
        </p>

        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 sm:text-base sm:font-medium">
          {product.name}
        </h3>

        <div className="flex items-center justify-between pt-1">
          <p className="font-bold text-base text-gray-900 sm:text-lg">
            ₦{product.price.toLocaleString()}
          </p>
          {product.stock === 0 && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}