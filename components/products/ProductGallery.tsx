"use client";

import { useState } from "react";
import { motion } from "framer-motion";

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
  const [activeImage, setActiveImage] = useState(
    images[0] || FALLBACK_IMAGE
  );

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
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-4">
        {images.map((image: string, index: number) => (
          <motion.button
            key={index}
            onClick={() =>
              setActiveImage(image)
            }
            className={`relative w-16 h-20 sm:w-20 sm:h-24 border overflow-hidden transition-colors ${
              activeImage === image
                ? "border-black"
                : "border-gray-200"
            }`}
            variants={thumbnailVariants}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src={image}
              alt={productName}
              fill
              className="object-cover"
              onError={() => setActiveImage(FALLBACK_IMAGE)}
              sizes="30px"
            />
          </motion.button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 bg-gray-100 overflow-hidden">
        <motion.div
          key={activeImage}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-100"
        >
          <Image
            src={activeImage}
            alt={productName}
            width={1000}
            height={1200}
            className="w-full h-100 object-cover"
            onError={() => setActiveImage(FALLBACK_IMAGE)}
          />
        </motion.div>
      </div>
    </div>
  );
}