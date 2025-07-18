"use client"

import { Category } from "@/types/category"
import type React from "react"
import { useState, useRef, useEffect } from "react"

interface CategoryFilterProps {
  categories: Category[] // All categories, flat list
  selected: number[]
  setSelected: React.Dispatch<React.SetStateAction<number[]>>
}

// Helper function to get all descendant IDs of a category (including itself)
const getAllDescendantIds = (categoryId: number, allCategories: Category[]): number[] => {
  let ids: number[] = [categoryId]
  const children = allCategories.filter((c) => c.parent === categoryId)
  children.forEach((child) => {
    ids = ids.concat(getAllDescendantIds(child.id, allCategories))
  })
  return ids
}

// Helper function to determine checkbox state (checked, indeterminate)
const getCheckboxState = (category: Category, selected: number[], allCategories: Category[]) => {
  const descendantIds = getAllDescendantIds(category.id, allCategories)
  const selectedDescendants = descendantIds.filter((id) => selected.includes(id))

  if (selectedDescendants.length === 0) {
    return { checked: false, indeterminate: false }
  }
  if (selectedDescendants.length === descendantIds.length) {
    return { checked: true, indeterminate: false }
  }
  return { checked: false, indeterminate: true }
}

// Recursive component for rendering category items
const CategoryItem: React.FC<{
  category: Category
  allCategories: Category[] // Pass all categories for descendant lookup
  selected: number[]
  setSelected: React.Dispatch<React.SetStateAction<number[]>>
}> = ({ category, allCategories, selected, setSelected }) => {
  const children = allCategories.filter((c) => c.parent === category.id)
  const { checked, indeterminate } = getCheckboxState(category, selected, allCategories)
  const [isOpen, setIsOpen] = useState(false) // State for accordion-like behavior
  const checkboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  const handleToggle = (isChecked: boolean) => {
    const descendantIds = getAllDescendantIds(category.id, allCategories)

    setSelected((prevSelected) => {
      const newSelected = new Set(prevSelected)
      if (isChecked) {
        descendantIds.forEach((id) => newSelected.add(id))
      } else {
        descendantIds.forEach((id) => newSelected.delete(id))
      }
      return Array.from(newSelected)
    })
  }

  return (
    <div>
      {children.length > 0 ? (
        <div className="w-full">
          <div className="flex items-center justify-between py-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`category-${category.id}`}
                checked={checked}
                onChange={(e) => handleToggle(e.target.checked)}
                ref={checkboxRef}
                className="h-4 w-4 text-black rounded border-gray-300 focus:ring-black focus:ring-offset-0"
              />
              <label htmlFor={`category-${category.id}`} className="cursor-pointer text-sm font-medium">
                {category.name}
              </label>
            </div>
            <span className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
              &#9660; {/* Down arrow */}
            </span>
          </div>
          {isOpen && (
            <div className="pl-6 pt-0 pb-2">
              {children.map((child) => (
                <CategoryItem
                  key={child.id}
                  category={child}
                  allCategories={allCategories}
                  selected={selected}
                  setSelected={setSelected}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <label htmlFor={`category-${category.id}`} className="flex items-center gap-2 font-normal cursor-pointer py-1">
          <input
            type="checkbox"
            id={`category-${category.id}`}
            checked={selected.includes(category.id)}
            onChange={(e) => handleToggle(e.target.checked)}
            className="h-4 w-4 text-black rounded border-gray-300 focus:ring-black focus:ring-offset-0"
          />
          <span className="text-sm">{category.name}</span>
        </label>
      )}
    </div>
  )
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selected, setSelected }) => {
  // Filter for top-level categories (those without a parent or with parent as null/undefined)
  const topLevelCategories = categories.filter((c) => c.parent === undefined || c.parent === null)

  return (
    <div className="grid gap-2">
      {topLevelCategories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          allCategories={categories}
          selected={selected}
          setSelected={setSelected}
        />
      ))}
    </div>
  )
}

export default CategoryFilter
