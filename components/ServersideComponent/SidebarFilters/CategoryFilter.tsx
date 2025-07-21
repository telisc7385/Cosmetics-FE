"use client"
import type { Category } from "@/types/category"
import { ChevronDownIcon } from "lucide-react"
import type React from "react"
import { useState } from "react"

interface CategoryFilterProps {
  categories: Category[]
  selectedCats: number[]
  setSelectedCats: React.Dispatch<React.SetStateAction<number[]>>
  selectedSubcats: number[]
  setSelectedSubcats: React.Dispatch<React.SetStateAction<number[]>>
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCats,
  setSelectedCats,
  selectedSubcats,
  setSelectedSubcats,
}) => {
  const [openCategories, setOpenCategories] = useState<Set<number>>(new Set())

  const toggleCategory = (categoryId: number) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

 const handleParentCategoryChange = (category: Category, isChecked: boolean) => {
  const subIds = category.subcategories?.map(s => s.id) ?? [];

  if (isChecked) {
    // only add if not already present
    setSelectedCats(prev => Array.from(new Set([...prev, category.id])));
    // clear any of its subcats
    setSelectedSubcats(prev => prev.filter(id => !subIds.includes(id)));
  } else {
    // remove parent
    setSelectedCats(prev => prev.filter(id => id !== category.id));
    // also clear its subcats
    setSelectedSubcats(prev => prev.filter(id => !subIds.includes(id)));
  }
};


  const handleSubcategoryChange = (
    subcategory: Category["subcategories"][0],
    parentCategory: Category,
    isChecked: boolean
  ) => {
    const subcategoryIds = parentCategory.subcategories!.map((s) => s.id);

    // Always drop the parent if any subcat toggles
    setSelectedCats((prev) => prev.filter((id) => id !== parentCategory.id));

    if (isChecked) {
      setSelectedSubcats((prev) => {
        const newSubs = [...prev, subcategory.id];

        // If now all subcategories are selected, promote to parent
        const selectedCount = newSubs.filter((id) =>
          subcategoryIds.includes(id)
        ).length;
        if (selectedCount === subcategoryIds.length) {
          // 1) add parent  
          setSelectedCats((cats) => [...cats, parentCategory.id]);
          // 2) clear its subcats
          return prev.filter((id) => !subcategoryIds.includes(id));
        }

        return newSubs;
      });
    } else {
      // Unchecking one: just remove it
      setSelectedSubcats((prev) => prev.filter((id) => id !== subcategory.id));
    }
  };


  const getParentCheckboxState = (category: Category) => {
    const isParentSelected = selectedCats.includes(category.id)
    const subcategoryIds = category.subcategories?.map((sub) => sub.id)
    const selectedSubcategoryCount = subcategoryIds?.filter((id) => selectedSubcats.includes(id)).length

    if (isParentSelected) {
      return { checked: true, indeterminate: false }
    }

    if (selectedSubcategoryCount === 0) {
      return { checked: false, indeterminate: false }
    }

    if (selectedSubcategoryCount === subcategoryIds?.length) {
      return { checked: true, indeterminate: false }
    }

    return { checked: false, indeterminate: true }
  }

  const isSubcategoryChecked = (subcategory: any, parentCategory: Category) => {
    // If parent is selected, all subcategories appear checked
    if (selectedCats.includes(parentCategory.id)) {
      return true
    }
    // Otherwise, check individual subcategory selection
    return selectedSubcats.includes(subcategory.id)
  }

  return (
    <div className="grid gap-2">
      {categories.map((category) => {
        const hasSubcategories = category.subcategories && category.subcategories.length > 0
        const { checked, indeterminate } = getParentCheckboxState(category)
        const isOpen = openCategories.has(category.id)

        return (
          <div key={category.id}>
            {hasSubcategories ? (
              <div className="w-full">
                <div className="flex items-center justify-between py-1 ">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={checked}
                      ref={(el) => {
                        if (el) el.indeterminate = indeterminate
                      }}
                      onChange={(e) => handleParentCategoryChange(category, e.target.checked)}
                      className="h-4 w-4 text-black rounded border-gray-300 focus:ring-black focus:ring-offset-0"
                    />
                    <label htmlFor={`category-${category.id}`} className="cursor-pointer text-sm font-medium">
                      {category.name}
                    </label>
                  </div>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""} p-1`}
                  >
                    <ChevronDownIcon className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {isOpen && (
                  <div className="pl-6 space-y-1">
                    {category.subcategories?.map((subcategory) => (
                      <label
                        key={subcategory.id}
                        htmlFor={`subcategory-${subcategory.id}`}
                        className="flex items-center gap-2 font-normal cursor-pointer py-1 text-[#213E5A]"
                      >
                        <input
                          type="checkbox"
                          id={`subcategory-${subcategory.id}`}
                          checked={isSubcategoryChecked(subcategory, category)}
                          onChange={(e) => handleSubcategoryChange(subcategory, category, e.target.checked)}
                          className="h-4 w-4 text-black rounded border-gray-300 focus:ring-black focus:ring-offset-0"
                        />
                        <span className="text-sm">{subcategory.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Category without subcategories
              <label
                htmlFor={`category-${category.id}`}
                className="flex items-center gap-2 font-normal cursor-pointer py-1 text-[#213E5A]"
              >
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={selectedCats.includes(category.id)}
                  onChange={(e) => handleParentCategoryChange(category, e.target.checked)}
                  className="h-4 w-4 text-black rounded border-gray-300 focus:ring-black focus:ring-offset-0"
                />
                <span className="text-sm">{category.name}</span>
              </label>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CategoryFilter
