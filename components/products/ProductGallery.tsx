"use client";

import { useState } from "react";

import Image from "next/image";

export default function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [activeImage, setActiveImage] =
    useState(images[0]);

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
        />
      </div>
    </div>
  );
}