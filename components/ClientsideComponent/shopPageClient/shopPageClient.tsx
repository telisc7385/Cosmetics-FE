// ShopPageClient.tsx
"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import SidebarFilters from "@/components/ServersideComponent/SidebarFilters/SidebarFilters";
import SortDropdown from "../SortDropdown/SortDropdown";
import ProductList from "./ProductList";

import { FunnelIcon } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { Category } from "@/api/fetchCategories";

interface Props {
  categories: Category[];
}

type SortOrder = "" | "price_asc" | "price_desc";

export default function ShopPageClient({ categories }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100000);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const limit = 8;
  const base = process.env.NEXT_PUBLIC_BASE_URL;

  // State to store the mapping of tag names to their IDs
  const [tagNameToIdMap, setTagNameToIdMap] = useState<Map<string, number>>(
    new Map()
  );

  useEffect(() => {
    // Fetch tags initially to build the name-to-id map
    const fetchAllTags = async () => {
      try {
        const res = await fetch(`${base}/product?product-tag`); // Fetch all products or a specific endpoint that lists all tags
        const data = await res.json();
        const allProductsTags = data.products?.flatMap(
          (product: any) => product.tags || [] // Assuming product.tags is an array of {id: number, name: string}
        );

        const newMap = new Map<string, number>();
        allProductsTags.forEach((tag: { id: number; name: string }) => {
          if (tag && tag.id && tag.name) {
            newMap.set(tag.name, tag.id);
          }
        });
        setTagNameToIdMap(newMap);
      } catch (err) {
        console.error("Failed to fetch all tags for mapping:", err);
      }
    };
    fetchAllTags();
  }, [base]); // Run once on component mount to get tags for mapping

  useEffect(() => {
    const qCats = selectedCats.map((id) => `category=${id}`).join("&");

    // Convert selected tag names to their corresponding IDs
    const selectedTagIds = selectedTags
      .map((tagName) => tagNameToIdMap.get(tagName))
      .filter((id) => id !== undefined) as number[]; // Filter out undefined and assert type

    // Construct qTags using comma-separated IDs and the 'tags' parameter
    const qTags =
      selectedTagIds.length > 0 ? `tags=${selectedTagIds.join(",")}` : "";

    const sortParam =
      sortOrder === "price_asc"
        ? "selling_price"
        : sortOrder === "price_desc"
        ? "-selling_price"
        : "";

    const url =
      `${base}/product?page=${currentPage}&limit=${limit}` +
      (qCats ? `&${qCats}` : "") +
      (qTags ? `&${qTags}` : "") + // Use the new qTags
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
  }, [
    selectedCats,
    selectedTags,
    sortOrder,
    min,
    max,
    currentPage,
    base,
    tagNameToIdMap,
  ]); // Add tagNameToIdMap to dependencies

  const handleClearFilters = () => {
    setSelectedCats([]);
    setSelectedTags([]);
    setSortOrder("");
    setMin(0);
    setMax(100000);
    setCurrentPage(1); // Reset to first page on clearing filters
  };

  return (
    <>
      {/* ✅ Main Content Container */}
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-4 p-4">
          {/* Filter button for mobile view (with functionality) */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 text-sm text-gray-700 font-medium lg:hidden ml-4 sm:ml-0"
          >
            <FunnelIcon className="h-5 w-5" />
            Filter
          </button>

          {/* New structure for laptop filter and clear options */}
          <div className="hidden lg:flex items-center gap-6 ml-4 sm:ml-0">
            <div
              className="flex items-center gap-3 text-lg font-medium px-5 py-2.5 rounded-md"
              style={{ backgroundColor: "#22365D", color: "white" }}
            >
              <FunnelIcon className="h-7 w-7" />
              Filter
            </div>
            <button
              onClick={handleClearFilters}
              className="text-lg text-gray-600 hover:text-black underline underline-offset-2 transition"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 ml-auto mr-4 sm:mr-0">
            <button
              onClick={handleClearFilters}
              className="text-[12px] sm:text-sm mr-2 text-gray-600 hover:text-black underline underline-offset-2 transition lg:hidden"
            >
              Clear
            </button>
            {/* HERE IS THE CHANGE: Reduced padding and font size for mobile view dropdown */}
            <div
              className="bg-white rounded-md border shadow-sm flex items-center gap-1
             sm:gap-2  text-sm sm:text-base"
            >
              <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* The sidebar filters are already visible on large screens with 'hidden lg:block' */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
              <SidebarFilters
                categories={categories}
                selected={selectedCats}
                setSelected={setSelectedCats}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                min={min}
                max={max}
                setMin={setMin}
                setMax={setMax}
              />
            </div>
          </div>

          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/40 z-40 flex items-start pt-8">
              <div className="w-full bg-white rounded-t-2xl p-5 shadow-lg max-h-[85vh] overflow-y-auto mt-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-900 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md p-1"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <SidebarFilters
                  categories={categories}
                  selected={selectedCats}
                  setSelected={setSelectedCats}
                  selectedTags={selectedTags}
                  setSelectedTags={setSelectedTags}
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

          <div className="lg:w-3/4 w-full">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <ProductList products={products} />
            </div>

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
    </>
  );
}
