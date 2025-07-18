// SortDropdown.tsx
"use client";

type SortOrder = "" | "price_asc" | "price_desc";

interface SortDropdownProps {
  sortOrder: SortOrder;
  setSortOrder: (value: SortOrder) => void;
}

export default function SortDropdown({
  sortOrder,
  setSortOrder,
}: SortDropdownProps) {
  return (
    <select
      value={sortOrder}
      onChange={(e) => setSortOrder(e.target.value as SortOrder)}
      // Added mobile-specific sizing classes (text-xs, h-8, px-2) and responsive classes for larger screens
      className="w-full border text-black h-12 rounded px-2 py-2.5 text-xs shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-black sm:h-10 sm:px-3 sm:text-sm"
    >
      <option value="">Sort by</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
