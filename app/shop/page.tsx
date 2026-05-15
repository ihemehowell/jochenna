"use client";

import { ChevronDown, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  filterProducts,
  getProductCategories,
  type FilterProductsParams,
} from "@/lib/api";
import type { Product, AgeGroup } from "@/lib/types";
import ProductCard from "@/components/products/ProductCard";
import ShopFilters, {
  type ShopFiltersState,
} from "@/components/shop/ShopFilters";
import { findShopCategoryGroup } from "@/lib/shopTaxonomy";

const DEFAULT_CATEGORIES = [
  { key: "clothes", label: "Clothes" },
  { key: "toys", label: "Toys" },
  { key: "baby", label: "Baby" },
  { key: "shoes", label: "Shoes" },
  { key: "accessories", label: "Accessories" },
];

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [filters, setFilters] = useState<ShopFiltersState>({
    category: "all",
    ageGroup: "all",
    gender: "all",
    condition: "all",
  });
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "best-selling">("featured");
  const categoryParam = searchParams.get("category")?.trim() || "";
  const subcategoryParam = searchParams.get("subcategory")?.trim() || "";
  const activeCategory = categoryParam || filters.category;
  const activeSubcategory = subcategoryParam;
  const activeCategoryGroup = findShopCategoryGroup(activeCategory === "all" ? "" : activeCategory);

  const formatCategory = (category: string) =>
    category
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getProductCategories();
      if (data.length > 0) {
        setCategories(data.map((item) => ({ key: item, label: item })));
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);

      const baseSearch = search.trim();
      const mergedSearch = [baseSearch, activeSubcategory].filter(Boolean).join(" ");

      const params: FilterProductsParams = {
        search: mergedSearch || undefined,
        category: activeCategory === "all" ? undefined : activeCategory,
        sort: sortBy === "featured" ? undefined : sortBy,
        page,
        limit,
        ageGroup: filters.ageGroup === "all" ? undefined : filters.ageGroup,
        gender: filters.gender === "all" ? undefined : filters.gender,
        condition: filters.condition === "all" ? undefined : filters.condition,
      };

      const result = await filterProducts(params);
      setProducts(result.products);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setLoading(false);
    };

    fetchFilteredProducts();
  }, [activeCategory, activeSubcategory, filters, limit, page, search, sortBy]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (next: ShopFiltersState) => {
    setFilters(next);
    setPage(1);

    if (categoryParam || subcategoryParam) {
      const nextCategory = next.category;

      if (nextCategory === "all") {
        router.push("/shop");
        return;
      }

      router.push(`/shop?category=${encodeURIComponent(nextCategory)}`);
    }
  };

  const handleSortChange = (value: "featured" | "price-asc" | "price-desc" | "best-selling") => {
    setSortBy(value);
    setPage(1);
  };

  const ageGroups: AgeGroup[] = [
    "0-6m",
    "6-12m",
    "1-2y",
    "3-5y",
    "6-10y",
  ];

  return (
    <main className="px-4 md:px-8 py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="uppercase tracking-[0.3em] text-sm text-gray-500 mb-2">
                Find items for my child quickly
              </p>
            </div>
          </div>

          
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen((current) => !current)}
            className="inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:border-gray-300"
          >
            <Filter size={16} />
            {filtersOpen ? "Hide filters" : "Show filters"}
            <ChevronDown
              size={16}
              className={`transition-transform ${filtersOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <div
          className={
            filtersOpen
              ? "grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr] lg:gap-12"
              : "grid grid-cols-1 gap-8"
          }
        >
          {filtersOpen && (
            <div className="space-y-4">
              <ShopFilters
                search={search}
                onSearchChange={handleSearchChange}
                filters={filters}
                onFiltersChange={handleFilterChange}
                categories={categories}
                ageGroups={ageGroups}
              />
            </div>
          )}

          {/* Products */}
          <section className="space-y-8">
            <div className="flex flex-col gap-4 mb-8    sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center  ">
                <p className="text-gray-500">{total} items</p>

                {/* Active chips */}
                <div className="flex flex-wrap gap-2">
                  {activeCategory !== "all" && (
                    <button
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize text-gray-700 transition hover:bg-gray-200"
                      onClick={() =>
                        categoryParam
                          ? router.push("/shop")
                          : setFilters((s) => ({ ...s, category: "all" }))
                      }
                    >
                      {formatCategory(activeCategory)}
                    </button>
                  )}

                  {activeSubcategory && (
                    <button
                      className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700 transition hover:bg-rose-200"
                      onClick={() => {
                        if (activeCategory !== "all") {
                          router.push(`/shop?category=${encodeURIComponent(activeCategory)}`);
                          return;
                        }

                        router.push("/shop");
                      }}
                    >
                      {activeSubcategory}
                    </button>
                  )}

                  {filters.ageGroup !== "all" && (
                    <button
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 transition hover:bg-blue-200"
                      onClick={() => setFilters((s) => ({ ...s, ageGroup: "all" }))}
                    >
                      {filters.ageGroup === "0-6m"
                        ? "0–6 months"
                        : filters.ageGroup === "6-12m"
                        ? "6–12 months"
                        : filters.ageGroup === "1-2y"
                        ? "1–2 years"
                        : filters.ageGroup === "3-5y"
                        ? "3–5 years"
                        : "6–10 years"}
                    </button>
                  )}

                  {filters.condition !== "all" && (
                    <button
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        filters.condition === "like-new"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : filters.condition === "gently-used"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setFilters((s) => ({ ...s, condition: "all" }))}
                    >
                      {filters.condition === "like-new"
                        ? "Like New"
                        : filters.condition === "gently-used"
                        ? "Gently Used"
                        : "Used"}
                    </button>
                  )}

                  {filters.gender !== "all" && (
                    <button
                      className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs text-fuchsia-700 transition hover:bg-fuchsia-200"
                      onClick={() => setFilters((s) => ({ ...s, gender: "all" }))}
                    >
                      {filters.gender}
                    </button>
                  )}
                </div>
              </div>

              {activeCategoryGroup && activeCategoryGroup.subcategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeCategoryGroup.subcategories.map((subcategory) => {
                    const isActiveSubcategory =
                      subcategory.toLowerCase() === activeSubcategory.toLowerCase();

                    return (
                      <button
                        key={subcategory}
                        type="button"
                        onClick={() =>
                          router.push(
                            `/shop?category=${encodeURIComponent(activeCategory)}&subcategory=${encodeURIComponent(subcategory)}`
                          )
                        }
                        className={`rounded-full px-3 py-1 text-xs transition ${
                          isActiveSubcategory
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                        }`}
                      >
                        {subcategory}
                      </button>
                    );
                  })}
                </div>
              )}

                  
              <label className="flex items-center gap-3 text-sm text-gray-500">
                <span className="whitespace-nowrap font-medium text-gray-700">Sort by</span>
                <span className="relative inline-flex min-w-55 items-center">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      handleSortChange(
                        e.target.value as "featured" | "price-asc" | "price-desc" | "best-selling"
                      )
                    }
                    className="w-full appearance-none rounded-full border border-gray-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-gray-900 shadow-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  >
                    <option value="featured">Featured</option>
                    <option value="best-selling">Best Selling</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 text-gray-500"
                  />
                </span>
              </label>
            </div>

            {loading ? (
              <div className="flex h-75 items-center justify-center border border-dashed border-gray-300 bg-white">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex h-75 items-center justify-center border border-dashed border-gray-300 bg-white">
                <p className="text-gray-500">
                  No products found.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <ProductCard
                      key={String(product.id)}
                      product={product}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
                    <p className="text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page <= 1}
                        className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={page >= totalPages}
                        className="rounded bg-gray-900 px-4 py-2 text-sm text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}