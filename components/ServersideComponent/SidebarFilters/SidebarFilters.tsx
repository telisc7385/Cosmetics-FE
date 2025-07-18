"use client";

import { useEffect, useState } from "react";
import CategoryFilter from "./CategoryFilter";
import PriceFilter from "@/components/ServersideComponent/SidebarFilters/PriceFilter";
import { Category } from "@/types/category";

interface Tag {
  id: number;
  name: string;
}

interface Props {
  categories: Category[];
  selected: number[];
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  min: number;
  max: number;
  setMin: React.Dispatch<React.SetStateAction<number>>;
  setMax: React.Dispatch<React.SetStateAction<number>>;
}

// Interfaces to type API response properly
interface APITag {
  id: number;
  name: string;
}

interface APIProduct {
  tags?: APITag[];
}

export default function SidebarFilters({
  categories,
  selected,
  setSelected,
  selectedTags,
  setSelectedTags,
  min,
  max,
  setMin,
  setMax,
}: Props) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/product?product-tag`
        );
        const data = await res.json();

        const allTags = data.products?.flatMap(
          (product: APIProduct) => product.tags || []
        );

        const uniqueTagsMap = new Map<number, APITag>();
        allTags.forEach((tag: APITag) => {
          if (tag && tag.id && !uniqueTagsMap.has(tag.id)) {
            uniqueTagsMap.set(tag.id, tag);
          }
        });

        setTags(Array.from(uniqueTagsMap.values()));
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };

    fetchTags();
  }, []);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <h2 className="font-semibold text-lg text-gray-800">Categories</h2>
        <hr className="my-2 border-gray-300" />
        <CategoryFilter
          categories={categories}
          selected={selected}
          setSelected={setSelected}
        />
      </div>

      {/* Price Filter */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <h2 className="font-semibold text-lg text-gray-800">Price Range</h2>
        <hr className="my-2 border-gray-300" />
        <PriceFilter min={min} max={max} setMin={setMin} setMax={setMax} />
      </div>

      {/* Product Tags Filter */}
      {tags.length > 0 && (
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h2 className="font-semibold text-lg text-gray-800">Tags</h2>
          <hr className="my-2 border-gray-300" />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                className={`px-3 py-1 text-xs rounded-full border transition ${
                  selectedTags.includes(tag.name)
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
                onClick={() =>
                  setSelectedTags((prev) =>
                    prev.includes(tag.name)
                      ? prev.filter((t) => t !== tag.name)
                      : [...prev, tag.name]
                  )
                }
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
