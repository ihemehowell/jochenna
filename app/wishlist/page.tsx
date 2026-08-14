"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/shore/wishlistStore";
import ProductCard from "@/components/products/ProductCard";

export default function WishlistPage() {
  const wishlist = useWishlistStore((state) => state.wishlist);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <main className="px-4 md:px-8 py-10 bg-paper">
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div className="mb-12" variants={itemVariants}>
          <p className="uppercase tracking-[0.3em] text-sm text-ink-soft mb-3 flex items-center gap-2">
            <Heart size={16} />
            My Wishlist
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold text-ink">
            Saved Items
          </h1>
        </motion.div>

        {/* Content */}
        {wishlist.length === 0 ? (
          <motion.div
            className="h-96 flex flex-col items-center justify-center border border-dashed border-hairline rounded"
            variants={itemVariants}
          >
            <Heart size={48} className="text-ink-soft mb-4" />
            <p className="text-ink-soft mb-6">Your wishlist is empty</p>
            <Link href="/shop">
              <motion.button
                className="flex items-center gap-2 bg-ink text-white px-6 py-3 rounded hover:bg-ink transition"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue Shopping
                <ArrowRight size={18} />
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.p
              className="text-ink-soft mb-8"
              variants={itemVariants}
            >
              {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved
            </motion.p>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {wishlist.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </motion.div>
          </>
        )}
      </motion.div>
    </main>
  );
}
