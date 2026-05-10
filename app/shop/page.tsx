"use client";

import { useState } from "react";
import { products } from "@/data/products";
import ProductCard from "@/components/products/ProductCard";

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [sortBy, setSortBy] = useState("featured");

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

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") {
      return a.price - b.price;
    }

    if (sortBy === "price-desc") {
      return b.price - a.price;
    }

    if (sortBy === "name-asc") {
      return a.name.localeCompare(b.name);
    }

    if (sortBy === "name-desc") {
      return b.name.localeCompare(a.name);
    }

    return a.id - b.id;
  });

  return (
    <main className="px-4 md:px-8 py-10 bg-gray-50">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <p className="text-gray-500">
                {sortedProducts.length} products
              </p>

              <label className="flex items-center gap-3 text-sm text-gray-500">
                Sort by
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 bg-white px-3 py-2 text-gray-800 outline-none focus:border-black"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </label>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="h-75 flex items-center justify-center border border-dashed border-gray-300">
                <p className="text-gray-500">
                  No products found.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {sortedProducts.map((product) => (
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