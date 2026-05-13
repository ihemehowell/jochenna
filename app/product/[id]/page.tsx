"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { getProductById, getProducts } from "@/lib/api";
import type { Product } from "@/lib/types";

import ProductCard from "@/components/products/ProductCard";
// import AddToCartButton from "@/components/products/AddToCartButton";
import ProductActions from "@/components/products/ProductAction";

const FALLBACK_IMAGE =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="960" viewBox="0 0 800 960"%3E%3Crect width="800" height="960" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="Arial, sans-serif" font-size="28"%3EImage unavailable%3C/text%3E%3C/svg%3E';



export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch product and related products from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage(null);
      
      // Fetch the product
      const productData = await getProductById(id);
      
      if (!productData) {
        setProduct(null);
        setRelatedProducts([]);
        setErrorMessage("We could not load this product right now.");
        setLoading(false);
        return;
      }
      
      setProduct(productData);
      
      // Fetch all products to find related ones
      const allProducts = await getProducts();
      const related = allProducts.filter(
        (item) =>
          item.category === productData.category &&
          String(item.id) !== String(productData.id)
      );
      
      setRelatedProducts(related);
      setLoading(false);
    };

    fetchData();
  }, [id]);

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <main className="px-4 md:px-8 py-10 bg-gray-50">
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading product...</p>
        </div>
      ) : errorMessage ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-gray-500">{errorMessage}</p>
          <Link
            href="/shop"
            className="rounded bg-gray-900 px-5 py-2 text-white hover:bg-gray-800 transition"
          >
            Back to shop
          </Link>
        </div>
      ) : !product ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Product not found</p>
        </div>
      ) : (
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        
        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Image */}
          <motion.div
            className="bg-gray-100"
            variants={imageVariants}
          >
            <Image
              src={product.images?.[0] || FALLBACK_IMAGE}
              alt={product.name}
              width={1000} 
              height={1000}
              className="w-full h-175 object-cover"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            className="flex flex-col justify-center"
            variants={itemVariants}
          >
            
            <p className="uppercase tracking-[0.2em] text-sm text-gray-500 mb-4">
              {product.category}
            </p>

            <h1 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight text-gray-900">
              {product.name}
            </h1>

            <p className="text-2xl font-semibold mb-8 text-gray-900">
              ₦{product.price.toLocaleString()}
            </p>

            <p className="text-gray-600 leading-relaxed mb-8">
              Carefully curated premium thrift fashion
              piece designed for modern streetwear and
              timeless styling.
            </p>

            {/* Stock */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {product.stock > 0 ? (
                <p className="text-green-600">
                  In Stock ({product.stock} left)
                </p>
              ) : (
                <p className="text-red-500">
                  Out of Stock
                </p>
              )}
            </motion.div>

            {/* Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <ProductActions product={product} />
            </motion.div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            className="mt-28"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            >
              <p className="uppercase tracking-[0.3em] text-sm text-gray-500 mb-3">
                You May Also Like
              </p>

              <h2 className="text-4xl font-semibold">
                Related Pieces
              </h2>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {relatedProducts.map((item, index) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  index={index}
                />
              ))}
            </motion.div>
          </motion.section>
        )}
      </motion.div>
      )}
    </main>
  );
}
