"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import SidebarFilters from "@/components/ServersideComponent/SidebarFilters/SidebarFilters";
import SortDropdown from "../SortDropdown/SortDropdown";
import ProductList from "./ProductList";
import { Category } from "@/types/category";
import { FunnelIcon } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface Props {
  categories: Category[];
}

type SortOrder = "" | "price_asc" | "price_desc";

export default function ShopPageClient({ categories }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100000);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const limit = 8;
  const base = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const qCats = selectedCats.map((id) => `category=${id}`).join("&");
    const sortParam =
      sortOrder === "price_asc"
        ? "selling_price"
        : sortOrder === "price_desc"
        ? "-selling_price"
        : "";

    const url =
      `${base}/product?page=${currentPage}&limit=${limit}` +
      (qCats ? `&${qCats}` : "") +
      `&min=${min}&max=${max}` +
      (sortParam ? `&sort=${sortParam}` : "");

    const fetchProducts = async () => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data.products);
        setTotalPages(data.totalPages ?? Math.ceil((data.count ?? 0) / limit));
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [selectedCats, sortOrder, min, max, currentPage, base]); // ✅ Added base here

  const handleClearFilters = () => {
    setSelectedCats([]);
    setSortOrder("");
    setMin(0);
    setMax(100000);
  };

  return (
    <div className="pt-28 container mx-auto max-w-7xl">
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-4 p-4">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center gap-2 text-sm text-gray-700 font-medium lg:hidden ml-4 sm:ml-0"
        >
          <FunnelIcon className="h-5 w-5" />
          Filter
        </button>

        {/* Sort + Clear */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto mr-4 sm:mr-0">
          <button
            onClick={handleClearFilters}
            className="text-[11px] sm:text-sm text-gray-600 hover:text-black underline underline-offset-2 transition"
          >
            Clear
          </button>
          <div className="bg-white px-1.5 py-1 rounded-md border border-gray-200 shadow-sm flex items-center gap-1 sm:gap-2 sm:px-3 sm:py-1.5">
            <label className="text-[11px] sm:text-sm font-medium text-gray-700 hidden sm:block">
              Sort:
            </label>
            <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar (Desktop) */}
        <div className="hidden lg:block lg:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <SidebarFilters
              categories={categories}
              selected={selectedCats}
              setSelected={setSelectedCats}
              min={min}
              max={max}
              setMin={setMin}
              setMax={setMax}
            />
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black/40 z-40 flex items-end">
            <div className="w-full bg-white rounded-t-2xl p-5 shadow-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-500 hover:text-black"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <SidebarFilters
                categories={categories}
                selected={selectedCats}
                setSelected={setSelectedCats}
                min={min}
                max={max}
                setMin={setMin}
                setMax={setMax}
              />

              <button
                onClick={() => {
                  handleClearFilters();
                  setShowMobileFilters(false);
                }}
                className="mt-4 w-full text-red-600 font-medium text-sm px-4 py-2 rounded-md border border-red-200 hover:bg-red-50 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Product Listing */}
        <div className="lg:w-3/4 w-full">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <ProductList products={products} />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded text-sm transition ${
                    currentPage === i + 1
                      ? "bg-black text-white"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
