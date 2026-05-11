"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import FeaturedProducts from "@/components/products/FeaturedProduct";

export default function HomePage() {
  const heroVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
      },
    }),
  };

  return (
    <main>
      {/* Hero */}
      <section className="min-h-[80vh] md:h-[90vh] flex items-center justify-center bg-gray-50">
        <motion.div
          className="max-w-2xl mx-auto text-center px-4"
          initial="hidden"
          animate="visible"
        >
          <motion.p
            className="uppercase tracking-[0.3em] text-sm text-gray-500 mb-4"
            custom={0}
            variants={heroVariants}
          >
            Premium Thrift Fashion
          </motion.p>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl font-semibold leading-tight max-w-4xl text-gray-800 mx-auto"
            custom={1}
            variants={heroVariants}
          >
            Curated thrift pieces for modern style.
          </motion.h1>

          <motion.div
            custom={2}
            variants={heroVariants}
            className="mt-8"
          >
            <Link href="/shop">
              <button className="bg-gray-900 text-white px-8 py-4 text-sm hover:bg-gray-800 transition duration-300 rounded">
                Shop Collection
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts />
    </main>
  );
}