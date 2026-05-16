"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getBestSellers } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

type FeaturedProductsProps = {
  eyebrow?: string;
  title?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  description?: string;
  sectionClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  showRankingBadges?: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
  productLimit?: number;
};

const CARDS_VISIBLE = 4;

export default function FeaturedProducts({


  viewAllHref = "/shop",
  sectionClassName = "py-10 px-3 md:px-6 bg-gray-900",

  descriptionClassName = "text-gray-300",
  showRankingBadges = false,
  loadingLabel = "Loading featured products...",
  emptyLabel = "No products found.",
  productLimit = 8,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDot, setActiveDot] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await getBestSellers(productLimit);
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, [productLimit]);

  const totalDots = Math.max(1, products.length - CARDS_VISIBLE + 1);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement;
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setActiveDot(index);
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = (track.children[0] as HTMLElement)?.offsetWidth ?? 0;
    const gap = 32; // gap-8 = 2rem = 32px
    const index = Math.round(track.scrollLeft / (cardWidth + gap));
    setActiveDot(Math.min(index, totalDots - 1));
  };

  return (
    <section className={sectionClassName}>
      <div className="max-w-7xl mx-auto">

        {/* Section heading */}
        

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-700 border-t-orange-500 rounded-full animate-spin mb-4" />
              <p className={descriptionClassName}>{loadingLabel}</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className={descriptionClassName}>{emptyLabel}</p>
          </div>
        ) : (
          <>
            {/* Card track */}
            <div
              ref={trackRef}
              onScroll={handleScroll}
              className="flex gap-8 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none" }}
            >
              {products.map((product, index) => (
                <motion.div
                  key={String(product.id)}
                  className="flex-none w-[72vw] sm:w-[44vw] lg:w-[calc(25%-24px)] snap-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                >
                  <ProductCard
                    product={product}
                    index={index}
                    rankingBadge={
                      showRankingBadges ? `#${index + 1} Best Seller` : undefined
                    }
                  />
                </motion.div>
              ))}
            </div>

            {/* Dot pagination */}
            {totalDots > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                {Array.from({ length: totalDots }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => scrollToIndex(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === activeDot
                        ? "w-8 h-3 bg-orange-500"
                        : "w-3 h-3 bg-gray-600 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}