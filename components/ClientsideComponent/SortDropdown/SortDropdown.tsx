"use client";

type SortOrder = "price_asc" | "price_desc";

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
      className="border h-11 sm:h-auto rounded px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-0.5 focus:ring-black"
    >
      <option className="text-sm" value="price_asc">
        Price: Low to High
      </option>
      <option className="text-sm" value="price_desc">
        Price: High to Low
      </option>
    </select>
  );
}
