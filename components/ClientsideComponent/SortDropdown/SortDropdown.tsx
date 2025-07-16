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
      className="border h-10 rounded px-3 py-1 text-sm shadow-sm bg-white focus:outline-none focus:ring-1 focus:ring-black"
    >
      <option value="">Default</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
