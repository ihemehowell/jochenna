"use client";

import { useState } from "react";

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

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-4">
        {images.map((image: string, index: number) => (
          <button
            key={index}
            onClick={() =>
              setActiveImage(image)
            }
            className={`relative w-20 h-24 border overflow-hidden ${
              activeImage === image
                ? "border-black"
                : "border-gray-200"
            }`}
          >
            <Image
              src={image}
              alt={productName}
              fill
              className="object-cover"
              onError={() => setActiveImage(FALLBACK_IMAGE)}
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 bg-gray-100 overflow-hidden">
        <Image
          src={activeImage}
          alt={productName}
          width={1000}
          height={1200}
          className="w-full h-100 object-cover hover:scale-105 transition duration-500"
          onError={() => setActiveImage(FALLBACK_IMAGE)}
        />
      </div>
    </div>
  );
}