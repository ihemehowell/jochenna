"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

// Placeholder images — swap these for real category images from your backend/CDN
const CATEGORY_IMAGES: Record<string, string> = {
  clothes: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
  toys: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80",
  baby: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80",
  shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  accessories: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80";

interface Category {
  key?: string;
  label?: string;
}

interface Props {
  categories: Category[];
}

const CARDS_VISIBLE = 4; // how many cards show at once on desktop

export default function PopularCategories({ categories }: Props) {
  const [activeDot, setActiveDot] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const totalDots = Math.max(1, categories.length - CARDS_VISIBLE + 1);

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
    const gap = 20;
    const index = Math.round(track.scrollLeft / (cardWidth + gap));
    setActiveDot(Math.min(index, totalDots - 1));
  };

  return (
    <section className="px-4 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          className="mb-8 flex items-start justify-between"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Popular Categories
          </h2>
          <Link
            href="/shop"
            className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors mt-2"
          >
            View all <span aria-hidden>›</span>
          </Link>
        </motion.div>

        {/* Card track */}
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((raw, index) => {
            // Normalise: backend may return plain strings or { key, label } objects
            const key = typeof raw === "string" ? raw : (raw.key ?? raw.label ?? "");
            const label = typeof raw === "string" ? raw : (raw.label ?? raw.key ?? "");
            if (!key) return null;

            const image = CATEGORY_IMAGES[key.toLowerCase()] ?? FALLBACK_IMAGE;

            return (
              <motion.div
                key={key}
                className="relative flex-none w-[72vw] sm:w-[44vw] lg:w-[calc(25%-15px)] snap-start"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { delay: index * 0.08, duration: 0.5 },
                  },
                }}
              >
                <Link href={`/shop?category=${encodeURIComponent(key)}`}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] shadow-md group cursor-pointer">
                    {/* Background image */}
                    <img
                      src={image}
                      alt={label}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient overlay — stronger at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Category label */}
                    <div className="absolute bottom-0 left-0 p-5">
                      <p className="text-xl font-bold leading-tight text-white drop-shadow-sm">
                        {label}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
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
                    : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}