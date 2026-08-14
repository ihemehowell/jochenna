"use client";

import { ChevronDown } from "lucide-react";
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
  const [sortBy, setSortBy] = useState<
    "featured" | "price-asc" | "price-desc" | "best-selling"
  >("featured");

  const categoryParam = searchParams.get("category")?.trim() || "";
  const subcategoryParam = searchParams.get("subcategory")?.trim() || "";
  const activeCategory = categoryParam || filters.category;
  const activeSubcategory = subcategoryParam;
  const activeCategoryGroup = findShopCategoryGroup(
    activeCategory === "all" ? "" : activeCategory
  );

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
      const mergedSearch = [baseSearch, activeSubcategory]
        .filter(Boolean)
        .join(" ");

      const params: FilterProductsParams = {
        search: mergedSearch || undefined,
        category: activeCategory === "all" ? undefined : activeCategory,
        sort: sortBy === "featured" ? undefined : sortBy,
        page,
        limit,
        ageGroup: filters.ageGroup === "all" ? undefined : filters.ageGroup,
        gender: filters.gender === "all" ? undefined : filters.gender,
        condition:
          filters.condition === "all" ? undefined : filters.condition,
      };

      const result = await filterProducts(params);
      setProducts(result.products);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setLoading(false);
    };

    fetchFilteredProducts();
  }, [
    activeCategory,
    activeSubcategory,
    filters,
    limit,
    page,
    search,
    sortBy,
  ]);

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

  const handleSortChange = (
    value: "featured" | "price-asc" | "price-desc" | "best-selling"
  ) => {
    setSortBy(value);
    setPage(1);
  };

  const ageGroups: AgeGroup[] = ["0-6m", "6-12m", "1-2y", "3-5y", "6-10y"];

  return (
    <main className="px-4 md:px-8 py-6 md:py-10 bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-ink-soft mb-2">
                Find items for my child quickly
              </p>
            </div>
          </div>
        </div>

        {/* Sort bar + Active Filter Chips */}
        <div className="mb-4 md:mb-6 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm md:text-base text-ink-soft">
              <span className="font-medium">{total}</span> items
            </p>

            <label className="flex items-center gap-2 text-xs md:text-sm text-ink-soft">
              <span className="font-medium whitespace-nowrap">Sort</span>
              <span className="relative inline-flex min-w-40 md:min-w-55 items-center">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    handleSortChange(
                      e.target.value as
                        | "featured"
                        | "price-asc"
                        | "price-desc"
                        | "best-selling"
                    )
                  }
                  className="w-full appearance-none rounded-lg md:rounded-full border border-hairline bg-white px-3 py-2 md:px-4 md:py-3 pr-8 md:pr-10 text-xs md:text-sm font-medium text-ink shadow-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
                >
                  <option value="featured">Featured</option>
                  <option value="best-selling">Best Selling</option>
                  <option value="price-asc">Low to High</option>
                  <option value="price-desc">High to Low</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-2 md:right-4 text-ink-soft"
                />
              </span>
            </label>
          </div>

          {/* Active Filter Chips */}
          {(activeCategory !== "all" ||
            activeSubcategory ||
            filters.ageGroup !== "all" ||
            filters.gender !== "all" ||
            filters.condition !== "all") && (
            <div className="flex flex-wrap gap-2">
              {activeCategory !== "all" && (
                <button
                  className="rounded-full bg-paper px-3 py-1 text-xs text-ink transition hover:bg-hairline"
                  onClick={() =>
                    categoryParam
                      ? router.push("/shop")
                      : setFilters((s) => ({ ...s, category: "all" }))
                  }
                >
                  ✕ {formatCategory(activeCategory)}
                </button>
              )}

              {activeSubcategory && (
                <button
                  className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700 transition hover:bg-rose-200"
                  onClick={() => {
                    if (activeCategory !== "all") {
                      router.push(
                        `/shop?category=${encodeURIComponent(activeCategory)}`
                      );
                      return;
                    }
                    router.push("/shop");
                  }}
                >
                  ✕ {activeSubcategory}
                </button>
              )}

              {filters.ageGroup !== "all" && (
                <button
                  className="rounded-full bg-denim/15 px-3 py-1 text-xs text-denim-text transition hover:bg-denim/20"
                  onClick={() =>
                    setFilters((s) => ({ ...s, ageGroup: "all" }))
                  }
                >
                  ✕ {filters.ageGroup}
                </button>
              )}

              {filters.gender !== "all" && (
                <button
                  className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs text-fuchsia-700 transition hover:bg-fuchsia-200"
                  onClick={() =>
                    setFilters((s) => ({ ...s, gender: "all" }))
                  }
                >
                  ✕ {filters.gender}
                </button>
              )}

              {filters.condition !== "all" && (
                <button
                  className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700 transition hover:bg-emerald-200"
                  onClick={() =>
                    setFilters((s) => ({ ...s, condition: "all" }))
                  }
                >
                  ✕ {filters.condition}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <ShopFilters
              search={search}
              onSearchChange={handleSearchChange}
              filters={filters}
              onFiltersChange={handleFilterChange}
              categories={categories}
              ageGroups={ageGroups}
            />
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden">
            <ShopFilters
              search={search}
              onSearchChange={handleSearchChange}
              filters={filters}
              onFiltersChange={handleFilterChange}
              categories={categories}
              ageGroups={ageGroups}
            />
          </div>

          {/* Products Column */}
          <section className="space-y-6 md:space-y-8">
            {/* Subcategory Pills */}
            {activeCategoryGroup &&
              activeCategoryGroup.subcategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {activeCategoryGroup.subcategories.map((subcategory) => {
                    const isActiveSubcategory =
                      subcategory.toLowerCase() ===
                      activeSubcategory.toLowerCase();

                    return (
                      <button
                        key={subcategory}
                        type="button"
                        onClick={() =>
                          router.push(
                            `/shop?category=${encodeURIComponent(
                              activeCategory
                            )}&subcategory=${encodeURIComponent(subcategory)}`
                          )
                        }
                        className={`rounded-full px-3 py-1 text-xs transition ${
                          isActiveSubcategory
                            ? "bg-ink text-white"
                            : "bg-paper text-ink-soft hover:bg-hairline hover:text-ink"
                        }`}
                      >
                        {subcategory}
                      </button>
                    );
                  })}
                </div>
              )}

            {/* Product Grid / States */}
            {loading ? (
              <div className="flex h-64 md:h-96 items-center justify-center border border-dashed border-hairline bg-white rounded-lg">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-hairline border-t-gray-900 rounded-full animate-spin mb-4" />
                  <p className="text-ink-soft">Loading products...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex h-64 md:h-96 items-center justify-center border border-dashed border-hairline bg-white rounded-lg">
                <div className="text-center">
                  <p className="text-ink-soft mb-2">No products found.</p>
                  <p className="text-sm text-ink-soft">
                    Try adjusting your filters
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
                  {products.map((product) => (
                    <ProductCard
                      key={String(product.id)}
                      product={product}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-between border-t border-hairline pt-6">
                    <p className="text-sm text-ink-soft">
                      Page {page} of {totalPages}
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={page <= 1}
                        className="rounded border border-hairline px-4 py-2 text-sm text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPage((prev) => Math.min(totalPages, prev + 1))
                        }
                        disabled={page >= totalPages}
                        className="rounded bg-ink px-4 py-2 text-sm text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
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