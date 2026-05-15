"use client";

import { X } from "lucide-react";
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
  const activeCount =
    Number(filters.category !== "all") +
    Number(filters.ageGroup !== "all") +
    Number(filters.condition !== "all") +
    Number(filters.gender !== "all");

  const setFilters = (next: Partial<ShopFiltersState>) =>
    onFiltersChange({ ...filters, ...next });

  return (
    <aside className="space-y-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gray-400">
            Find fast
          </p>
          <h2 className="mt-2 text-lg font-semibold text-gray-900">
            Search by age, condition, and category
          </h2>
        </div>

        {activeCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
            {activeCount} active
          </span>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Search toys, baby clothes, shoes...
        </label>
        <input
          type="text"
          placeholder="Search toddler shoes or baby bottle..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-gray-900"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">
            Quick Categories
          </h3>
          <button
            onClick={() => setFilters({ category: "all" })}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            <X size={12} />
            Reset
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters({ category: "all" })}
            className={`rounded-full px-3 py-2 text-sm transition ${
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
              className={`rounded-full px-3 py-2 text-sm transition ${
                filters.category === category.key
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">
          Age
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFilters({ ageGroup: "all" })}
            className={`rounded-2xl border px-3 py-3 text-left text-sm transition ${
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
              className={`rounded-2xl border px-3 py-3 text-left text-sm transition ${
                filters.ageGroup === age
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}
            >
              {ageLabelMap[age]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">
          Condition
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters({ condition: "all" })}
            className={`rounded-full px-3 py-2 text-sm transition ${
              filters.condition === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All conditions
          </button>
          {conditions.map((condition) => (
            <button
              key={condition}
              onClick={() => setFilters({ condition })}
              className={`rounded-full px-3 py-2 text-sm transition ${
                filters.condition === condition
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {conditionLabelMap[condition]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">
          Gender
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilters({ gender: "all" })}
            className={`rounded-full px-3 py-2 text-sm transition ${
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
              className={`rounded-full px-3 py-2 text-sm transition ${
                filters.gender === gender
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {genderLabelMap[gender]}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
