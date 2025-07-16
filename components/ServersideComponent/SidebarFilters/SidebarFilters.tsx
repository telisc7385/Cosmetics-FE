"use client";
import CategoryFilter from "./CategoryFilter";
import PriceFilter from "@/components/ServersideComponent/SidebarFilters/PriceFilter";
import { Category } from "@/types/category";

interface Props {
  categories: Category[];
  selected: number[];
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
  min: number;
  max: number;
  setMin: React.Dispatch<React.SetStateAction<number>>;
  setMax: React.Dispatch<React.SetStateAction<number>>;
}

export default function SidebarFilters({
  categories,
  selected,
  setSelected,
  min,
  max,
  setMin,
  setMax,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <h2 className="font-semibold text-lg text-gray-800">Categories</h2>
        <hr className="my-2 border-gray-300" />
        <CategoryFilter
          categories={categories}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <h2 className="font-semibold text-lg text-gray-800">Price Range</h2>
        <hr className="my-2 border-gray-300" />
        <PriceFilter min={min} max={max} setMin={setMin} setMax={setMax} />
      </div>
    </div>
  );
}
