"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const FALLBACK_IMAGE =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="960" viewBox="0 0 800 960"%3E%3Crect width="800" height="960" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, sans-serif" font-size="28"%3EImage unavailable%3C/text%3E%3C/svg%3E';

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const activeImage = images[activeIndex] || FALLBACK_IMAGE;

  // Handle swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeIndex < images.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else if (isRightSwipe && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handlePrevious = () => {
    setActiveIndex(Math.max(0, activeIndex - 1));
  };

  const handleNext = () => {
    setActiveIndex(Math.min(images.length - 1, activeIndex + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    galleryRef.current?.addEventListener("keydown", handleKeyDown);
    return () => galleryRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, images.length]);

  const thumbnailVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4" ref={galleryRef}>
      
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible">
        {images.map((image: string, index: number) => (
          <motion.button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`relative h-16 w-16 shrink-0 border-2 overflow-hidden rounded-lg transition-colors sm:h-20 sm:w-20 ${
              activeIndex === index
                ? "border-gray-900"
                : "border-gray-200 hover:border-gray-300"
            }`}
            variants={thumbnailVariants}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={image}
              alt={`${productName} - Image ${index + 1}`}
              fill
              className="object-cover"
              onError={() => setActiveImage(FALLBACK_IMAGE)}
              sizes="80px"
            />
          </motion.button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 bg-gray-100 overflow-hidden rounded-lg">
        {/* Touch Area */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-full"
        >
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full min-h-80 sm:min-h-96 md:min-h-screen"
          >
            <Image
              src={activeImage}
              alt={productName}
              width={1000}
              height={1200}
              className="w-full h-full object-cover"
              onError={() => console.error("Image failed to load")}
            />
          </motion.div>
        </div>

        {/* Navigation Arrows - Mobile */}
        {images.length > 1 && (
          <>
            <motion.button
              onClick={handlePrevious}
              disabled={activeIndex === 0}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur transition hover:bg-white disabled:opacity-30 md:left-4"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="text-gray-900" />
            </motion.button>

            <motion.button
              onClick={handleNext}
              disabled={activeIndex === images.length - 1}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur transition hover:bg-white disabled:opacity-30 md:right-4"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next image"
            >
              <ChevronRight size={20} className="text-gray-900" />
            </motion.button>

            {/* Image Counter */}
            <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}