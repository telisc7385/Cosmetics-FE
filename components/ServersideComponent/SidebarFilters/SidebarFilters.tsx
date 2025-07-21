"use client"

import type React from "react"

import { useEffect, useState } from "react"
import CategoryFilter from "./CategoryFilter" // Updated import path
import PriceFilter from "@/components/ServersideComponent/SidebarFilters/PriceFilter" // Assuming this path is correct
import { Category } from "@/types/category"
import { fetchAllTag } from "@/api/fetchProductBySlug"

interface Tag {
  id: number
  name: string
}

interface Props {
  categories: Category[]
  selected: number[]
  setSelected: React.Dispatch<React.SetStateAction<number[]>>
  selectedTags: number[]
  setSelectedTags: React.Dispatch<React.SetStateAction<number[]>>
  min: number
  max: number
  setMin: React.Dispatch<React.SetStateAction<number>>
  setMax: React.Dispatch<React.SetStateAction<number>>
  initialMin: number,
  initialMax: number
}

// Interfaces to type API response properly
interface APITag {
  id: number
  name: string
}

interface APIProduct {
  tags?: APITag[]
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
  initialMin,
  initialMax
}: Props) {
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetchAllTag();

        setTags(res)
      } catch (err) {
        console.error("Failed to fetch tags:", err)
      }
    }
    fetchTags()
  }, [])

  const handleTagChange = (tagid: number) => {
    setSelectedTags((prev) => (prev.includes(tagid) ? prev.filter((t) => t !== tagid) : [...prev, tagid]))
  }

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="bg-white rounded-xl border p-3 shadow-sm">
        <h2 className="font-semibold text-base text-gray-800">Categories</h2>
        <hr className="my-1.5 border-gray-300" />
        <CategoryFilter categories={categories} selected={selected} setSelected={setSelected} />
      </div>

      {/* Price Filter */}
      <div className="bg-white rounded-xl border p-3 shadow-sm">
        <h2 className="font-semibold text-base text-gray-800">Price Range</h2>
        <hr className="my-1.5 border-gray-300" />
        <PriceFilter min={min} max={max} setMin={setMin} setMax={setMax}
          initialMin={initialMin}
          initialMax={initialMax}
        />
      </div>

      {/* Product Tags Filter - Now with checkboxes and adjusted text size */}
      {tags.length > 0 && (
        <div className="bg-white rounded-xl border p-3 shadow-sm">
          <h2 className="font-semibold text-base text-gray-800">Tags</h2>
          <hr className="my-1.5 border-gray-300" />
          <div className="flex flex-col gap-2">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center space-x-1.5 text-sm cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => handleTagChange(tag.id)}
                  className="h-4 w-4 text-black rounded border-gray-300 focus:ring-black focus:ring-offset-0"
                />
                <span className="text-gray-800 text-sm">{tag.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
