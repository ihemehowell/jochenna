"use client";

import { useState } from "react";
import { X, Filter, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeGroup, Product } from "@/lib/types";

export type ShopFiltersState = {
  category: "all" | Product["category"];
  ageGroup: "all" | AgeGroup;
  gender: "all" | "boys" | "girls" | "unisex";
  condition: "all" | "like-new" | "gently-used" | "used";
};

type CategoryOption = {
  key: Product["category"];
  label: string;
};

type ShopFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  filters: ShopFiltersState;
  onFiltersChange: (next: ShopFiltersState) => void;
  categories: CategoryOption[];
  ageGroups: AgeGroup[];
};

const conditions = ["like-new", "gently-used", "used"] as const;
const genders = ["boys", "girls", "unisex"] as const;

const ageLabelMap: Record<AgeGroup, string> = {
  "0-6m": "0–6 months",
  "6-12m": "6–12 months",
  "1-2y": "1–2 years",
  "3-5y": "3–5 years",
  "6-10y": "6–10 years",
};

const conditionLabelMap = {
  "like-new": "Like New",
  "gently-used": "Gently Used",
  used: "Used",
} as const;

const genderLabelMap = {
  boys: "Boys",
  girls: "Girls",
  unisex: "Unisex",
} as const;

export default function ShopFilters({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  categories,
  ageGroups,
}: ShopFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const activeCount =
    Number(filters.category !== "all") +
    Number(filters.ageGroup !== "all") +
    Number(filters.condition !== "all") +
    Number(filters.gender !== "all");

  const setFilters = (next: Partial<ShopFiltersState>) =>
    onFiltersChange({ ...filters, ...next });

  const resetFilters = () => {
    onFiltersChange({
      category: "all",
      ageGroup: "all",
      gender: "all",
      condition: "all",
    });
    setMobileFiltersOpen(false);
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const drawerVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <button
        onClick={() => setExpandedSection(expandedSection === title ? null : title)}
        className="flex w-full items-center justify-between py-2"
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <motion.div
          animate={{ rotate: expandedSection === title ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={20} className="text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {expandedSection === title && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const FilterContent = (
    <>
      {/* Search */}
      <div className="space-y-3 mb-6">
        <label className="block text-sm font-medium text-gray-700">Search</label>
        <input
          type="text"
          placeholder="Search toys, shoes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none transition focus:border-gray-900"
        />
      </div>

      {/* Categories */}
      <FilterSection title="Category">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters({ category: "all" })}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              filters.category === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setFilters({ category: category.key })}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                filters.category === category.key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Age */}
      <FilterSection title="Age Group">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFilters({ ageGroup: "all" })}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              filters.ageGroup === "all"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-700 hover:border-gray-400"
            }`}
          >
            All ages
          </button>
          {ageGroups.map((age) => (
            <button
              key={age}
              onClick={() => setFilters({ ageGroup: age })}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                filters.ageGroup === age
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}
            >
              {ageLabelMap[age]}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condition">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters({ condition: "all" })}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              filters.condition === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {conditions.map((condition) => (
            <button
              key={condition}
              onClick={() => setFilters({ condition })}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                filters.condition === condition
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {conditionLabelMap[condition]}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Gender */}
      <FilterSection title="Gender">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters({ gender: "all" })}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              filters.gender === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {genders.map((gender) => (
            <button
              key={gender}
              onClick={() => setFilters({ gender })}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                filters.gender === gender
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {genderLabelMap[gender]}
            </button>
          ))}
        </div>
      </FilterSection>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sticky top-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">
            Find fast
          </p>
          <h2 className="mt-2 text-lg font-semibold text-gray-900">
            Refine your search
          </h2>
        </div>

        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200"
          >
            <X size={16} />
            Clear {activeCount} filter{activeCount !== 1 ? "s" : ""}
          </button>
        )}

        {FilterContent}
      </aside>

      {/* Mobile Filter Button & Drawer */}
      <div className="lg:hidden">
        <motion.button
          onClick={() => setMobileFiltersOpen(true)}
          className="fixed bottom-20 right-4 z-30 rounded-full bg-gray-900 p-4 text-white shadow-lg transition hover:bg-gray-800"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open filters"
        >
          <Filter size={24} />
          {activeCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </motion.button>

        <AnimatePresence mode="wait">
          {mobileFiltersOpen && (
            <>
              {/* Overlay */}
              <motion.div
                onClick={() => setMobileFiltersOpen(false)}
                className="fixed inset-0 bg-black/40 z-40"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              />

              {/* Drawer */}
              <motion.div
                className="fixed left-0 top-0 h-full w-[85%] max-w-sm bg-white z-50 overflow-y-auto"
                variants={drawerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Drawer Header */}
                <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4 z-10">
                  <h2 className="font-semibold text-lg">Filters</h2>
                  <motion.button
                    onClick={() => setMobileFiltersOpen(false)}
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                {/* Drawer Content */}
                <div className="px-6 py-6">
                  {FilterContent}
                </div>

                {/* Drawer Footer */}
                {activeCount > 0 && (
                  <div className="sticky bottom-0 border-t bg-white px-6 py-4 space-y-3">
                    <button
                      onClick={resetFilters}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-900 transition hover:bg-gray-50"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-800"
                    >
                      Apply Filters
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
