"use client";
import { Category } from "@/types/category";

interface Props {
  categories: Category[];
  selected: number[];
  setSelected: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function CategoryFilter({
  categories,
  selected,
  setSelected,
}: Props) {
  const parentCategories = categories.filter((c) => !c.parent);

  const getChildCategories = (parentId: number) =>
    categories.filter((c) => c.parent === parentId);

  const handleClick = (id: number, isParent: boolean) => {
    setSelected((prev) => {
      const isSelected = prev.includes(id);
      let updated = isSelected ? prev.filter((c) => c !== id) : [...prev, id];

      if (isParent) {
        const children = getChildCategories(id).map((child) => child.id);

        if (!isSelected) {
          updated = Array.from(new Set([...updated, ...children]));
        } else {
          updated = updated.filter((c) => !children.includes(c));
        }
      }

      return updated;
    });
  };

  return (
    <div className="space-y-3">
      {parentCategories.map((parent) => {
        const children = getChildCategories(parent.id);

        return (
          <div key={parent.id}>
            {/* Parent Checkbox */}
            <label className="flex items-center space-x-2 font-medium">
              <input
                type="checkbox"
                checked={selected.includes(parent.id)}
                onChange={() => handleClick(parent.id, true)}
              />
              <span className="text-gray-800">{parent.name}</span>
            </label>

            {/* Child Categories */}
            {children.length > 0 && (
              <div className="ml-6 mt-1 space-y-1">
                {children.map((child) => (
                  <label key={child.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(child.id)}
                      onChange={() => handleClick(child.id, false)}
                    />
                    <span className="text-gray-700 text-sm">{child.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
