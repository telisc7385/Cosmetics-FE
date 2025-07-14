"use client";

import { useState } from "react";
import { Category } from "@/types/category";
import PriceRangeSlider from "@/components/ClientsideComponent/PriceRangeSlider/PriceRangeSlider";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  categories: Category[];
  selectedCategories: number[];
  onCategoryChange: (id: number) => void;
  priceRange: [number, number];
  onPriceChange: (values: [number, number]) => void;
}

export default function SidebarFiltersClient({
  categories,
  selectedCategories,
  onCategoryChange,
  priceRange,
  onPriceChange,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="w-full lg:w-1/5">
      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between lg:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-indigo-600 font-medium flex items-center gap-1"
        >
          {showFilters ? "Hide" : "Show"} Filters
          {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Filter Panel */}
      <aside
        className={`space-y-6 ${
          showFilters ? "block" : "hidden"
        } lg:block sticky top-24 z-10`}
      >
        {/* 🗂 Category Filter */}
        <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-xl">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 border-b pb-2">
            Categories
          </h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 transition p-2 sm:p-3 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => onCategoryChange(cat.id)}
                  className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-indigo-600"
                />
                <span className="text-sm sm:text-base text-gray-700">
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 💰 Price Range Filter */}
        <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-xl">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-3 border-b pb-2">
            Price Range
          </h2>
          <PriceRangeSlider
            min={10}
            max={3999}
            values={priceRange}
            onChange={onPriceChange}
          />
        </div>
      </aside>
    </div>
  );
}
