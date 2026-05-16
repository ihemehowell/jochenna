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
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const galleryImages = images.length > 0 ? images : [FALLBACK_IMAGE];
  const activeImage = brokenImages[activeIndex]
    ? FALLBACK_IMAGE
    : galleryImages[activeIndex] || FALLBACK_IMAGE;

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

    if (isLeftSwipe && activeIndex < galleryImages.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else if (isRightSwipe && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handlePrevious = () => {
    setActiveIndex(Math.max(0, activeIndex - 1));
  };

  const handleNext = () => {
    setActiveIndex(Math.min(galleryImages.length - 1, activeIndex + 1));
  };

  const markImageAsBroken = (index: number) => {
    setBrokenImages((current) =>
      current[index] ? current : { ...current, [index]: true }
    );
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    galleryRef.current?.addEventListener("keydown", handleKeyDown);
    return () => galleryRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, galleryImages.length]);

  // useEffect(() => {
  //   if (activeIndex >= galleryImages.length) {
  //     setActiveIndex(Math.max(0, galleryImages.length - 1));
  //   }
  // }, [activeIndex, galleryImages.length]);


  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4" ref={galleryRef}>
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
            className="relative w-full h-full min-h-35 flex items-center justify-center"
          >
            <Image
              src={activeImage}
              alt={productName}
              width={1000}
              height={1200}
              className="w-full h-100 object-cover transition-opacity duration-300"
              onError={() => markImageAsBroken(activeIndex)}
            />
          </motion.div>
        </div>

        {/* Navigation Arrows - Mobile */}
        {galleryImages.length > 1 && (
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
              disabled={activeIndex === galleryImages.length - 1}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 backdrop-blur transition hover:bg-white disabled:opacity-30 md:right-4"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Next image"
            >
              <ChevronRight size={20} className="text-gray-900" />
            </motion.button>

            {/* Image Counter */}
            <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              {activeIndex + 1} / {galleryImages.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}