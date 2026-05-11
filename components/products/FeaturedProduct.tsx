"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/api";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await getProducts();
      // Show only first 4 products as featured
      setProducts(data.slice(0, 4));
      setLoading(false);
    };

    fetchProducts();
  }, []);
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
    <section className="py-20 px-4 md:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Heading */}
        <motion.div
          className="mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={headingVariants}
        >
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-3">
            Featured Collection
          </p>

          <h2 className="text-4xl font-semibold text-white">
            Latest Drops
          </h2>
        </motion.div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-400">Loading featured products...</p>
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
                key={product.id || product._id}
                product={product}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}