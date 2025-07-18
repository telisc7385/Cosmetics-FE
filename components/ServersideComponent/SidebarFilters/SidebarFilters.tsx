// SidebarFilters.tsx
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

  const handleTagChange = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="bg-white rounded-xl border p-3 shadow-sm">
        <h2 className="font-semibold text-base text-gray-800">Categories</h2>
        <hr className="my-1.5 border-gray-300" />
        <CategoryFilter
          categories={categories}
          selected={selected}
          setSelected={setSelected}
        />
      </div>

      {/* Price Filter */}
      <div className="bg-white rounded-xl border p-3 shadow-sm">
        <h2 className="font-semibold text-base text-gray-800">Price Range</h2>
        <hr className="my-1.5 border-gray-300" />
        <PriceFilter min={min} max={max} setMin={setMin} setMax={setMax} />
      </div>

      {/* Product Tags Filter - Now with checkboxes and adjusted text size */}
      {tags.length > 0 && (
        <div className="bg-white rounded-xl border p-3 shadow-sm">
          <h2 className="font-semibold text-base text-gray-800">Tags</h2>
          <hr className="my-1.5 border-gray-300" />
          <div className="flex flex-col space-y-1.5">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className="flex items-center space-x-1.5 font-medium text-sm"
              >
                {" "}
                {/* Added font-medium and set text-sm */}
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.name)}
                  onChange={() => handleTagChange(tag.name)}
                />
                <span className="text-gray-800 text-sm">{tag.name}</span>{" "}
                {/* Changed text-gray-700 to text-gray-800 for consistency with categories */}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
