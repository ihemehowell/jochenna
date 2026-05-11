"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useCartStore, type Product } from "@/shore/cartStore";
import { useWishlistStore } from "@/shore/wishlistStore";
import ProductGallery from "./ProductGallery";
import { useFeedbackStore } from "@/shore/feedbackStore";


type ProductCardProps = {
  product: Product;
  index?: number;
};

export default function ProductCard({
  product,
  index = 0,
}: ProductCardProps) {
  const addToCart = useCartStore.getState().addToCart;
  const pushToast = useFeedbackStore((state) => state.pushToast);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);

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
          {product.category}
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