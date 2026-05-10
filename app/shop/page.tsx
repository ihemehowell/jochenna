"use client";

import { useState } from "react";
import { products } from "@/data/products";
import ProductCard from "@/components/products/ProductCard";

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const categories = [
    "All",
    "T-Shirts",
    "Jackets",
    "Trousers",
    "Hoodies",
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="px-4 md:px-8 py-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <p className="uppercase tracking-[0.3em] text-sm text-gray-500 mb-3">
            Shop
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900">
            Explore Collection
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12">
          
          {/* Sidebar */}
          <aside className="space-y-8">
            
            {/* Search */}
            <div>
              <h3 className="font-medium mb-4 text-gray-500">
                Search
              </h3>

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-black transition text-gray-800"
              />
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-medium mb-4 text-gray-500">
                Categories
              </h3>

              <div className="flex flex-col gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      setSelectedCategory(category)
                    }
                    className={`text-left transition ${
                      selectedCategory === category
                        ? "font-semibold text-black"
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-500">
                {filteredProducts.length} products
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center border border-dashed border-gray-300">
                <p className="text-gray-500">
                  No products found.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}