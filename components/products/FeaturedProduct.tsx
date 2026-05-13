"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getBestSellers } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

type FeaturedProductsProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  sectionClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  showRankingBadges?: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
  productLimit?: number;
};

export default function FeaturedProducts({
  // eyebrow = "Featured Collection",
  // title = "Latest Drops",
  // description = "Hand-picked treasures for your growing family.",
  sectionClassName = "py-10 px-3 md:px-6 bg-gray-900",
  // titleClassName = "text-white",
  descriptionClassName = "text-gray-300",
  showRankingBadges = false,
  loadingLabel = "Loading featured products...",
  emptyLabel = "No products found.",
  productLimit = 4,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await getBestSellers(productLimit);
      setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, [productLimit]);
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

  const headingVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className={sectionClassName}>
      <div className="max-w-7xl mx-auto">
        
        {/* Section Heading */}
        <motion.div
          className="mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={headingVariants}
        >
          {/* <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-3">
              {eyebrow}
            </p>

            <h2 className={`text-4xl font-semibold ${titleClassName}`}>
              {title}
            </h2>

            <p className={`mt-3 text-lg ${descriptionClassName}`}>
              {description}
            </p>
          </div> */}

        </motion.div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className={descriptionClassName}>{loadingLabel}</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {products.map((product, index) => (
              <ProductCard
                key={String(product.id)}
                product={product}
                index={index}
                rankingBadge={showRankingBadges ? `#${index + 1} Best Seller` : undefined}
              />
            ))}
            {products.length === 0 && (
              <div className="col-span-full flex items-center justify-center py-16">
                <p className={descriptionClassName}>{emptyLabel}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}