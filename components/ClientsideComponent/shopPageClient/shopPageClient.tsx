"use client";
import { useEffect, useState } from "react";
import type { Product, ProductData } from "@/types/product";
import SidebarFilters from "@/components/ServersideComponent/SidebarFilters/SidebarFilters";
import SortDropdown from "../SortDropdown/SortDropdown";
import ProductList from "./ProductList";
import type { Category } from "@/types/category";
import { SlidersHorizontal } from "lucide-react";

interface Props {
  categories: Category[];
  initialProducts: ProductData;
}

type SortOrder = "" | "price_asc" | "price_desc";

export default function ShopPageClient({ categories, initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [selectedSubcats, setSelectedSubcats] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("");
  const [min, setMin] = useState(initialProducts?.minPrice);
  const [max, setMax] = useState(initialProducts?.maxPrice);
  const [initialMinPrice, setInitialMinPrice] = useState(
    initialProducts?.minPrice
  );
  const [initialMaxPrice, setInitialMaxPrice] = useState(
    initialProducts?.maxPrice
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const limit = 8;
  const base = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const qCats =
      selectedCats.length > 0
        ? selectedCats.map((id) => `category=${id}`).join("&")
        : "";
    const qSubcats =
      selectedSubcats.length > 0
        ? selectedSubcats.map((id) => `subcategory=${id}`).join("&")
        : "";
    const qTags =
      selectedTags.length > 0 ? `tags=${selectedTags.join(",")}` : "";
    const sortParam =
      sortOrder === "price_asc"
        ? "selling_price"
        : sortOrder === "price_desc"
        ? "-selling_price"
        : "";

    const url =
      `${base}/product?is_active=true&page=${currentPage}&limit=${limit}` +
      (qCats ? `&${qCats}` : "") +
      (qSubcats ? `&${qSubcats}` : "") +
      (qTags ? `&${qTags}` : "") +
      `&min=${min}&max=${max}` +  // use the old bounds here
      (sortParam ? `&sort=${sortParam}` : "");

    const fetchAndUpdateBounds = async () => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data.products);
        setTotalPages(data.totalPages ?? Math.ceil((data.count ?? 0) / limit));

        // **only here** do we update the “available” bounds
        // setInitialMinPrice(data.minPrice);
        // setInitialMaxPrice(data.maxPrice);

        // and reset the slider to that fresh range:
        // setMin(data.minPrice);
        // setMax(data.maxPrice);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAndUpdateBounds();
  }, [
    selectedCats,
    selectedSubcats,
    selectedTags,
    sortOrder,
    base,
    currentPage,
  ]);

  useEffect(() => {
    const qCats =
      selectedCats.length > 0
        ? selectedCats.map((id) => `category=${id}`).join("&")
        : "";
    const qSubcats =
      selectedSubcats.length > 0
        ? selectedSubcats.map((id) => `subcategory=${id}`).join("&")
        : "";
    const qTags =
      selectedTags.length > 0 ? `tags=${selectedTags.join(",")}` : "";
    const sortParam =
      sortOrder === "price_asc"
        ? "selling_price"
        : sortOrder === "price_desc"
        ? "-selling_price"
        : "";

    const url =
      `${base}/product?is_active=true&page=${currentPage}&limit=${limit}` +
      (qCats ? `&${qCats}` : "") +
      (qSubcats ? `&${qSubcats}` : "") +
      (qTags ? `&${qTags}` : "") +
      `&min=${min}&max=${max}` + // now we use the user‑driven slider values
      (sortParam ? `&sort=${sortParam}` : "");

    const fetchProducts = async () => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data.products);
        setTotalPages(data.totalPages ?? Math.ceil((data.count ?? 0) / limit));
        // <-- NO setInitialMin/Max calls here
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [min, max, sortOrder, currentPage, base]);
  console.log("IN SHop", initialMinPrice, initialMaxPrice);

  const handleClearFilters = () => {
    setSelectedCats([]);
    setSelectedSubcats([]);
    setSelectedTags([]);
    setSortOrder("");
    setMin(initialProducts?.minPrice);
    setMax(initialProducts?.maxPrice);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Main Content Container */}
      <div className="container mx-auto max-w-7xl flex flex-col gap-4 p-4 md:p-6">
        <div className="flex justify-between items-center gap-4 md:gap-6">
          {/* Filter button for mobile view */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-3 text-lg font-medium px-5 py-2.5 rounded-md md:hidden w-1/2"
            style={{ backgroundColor: "#22365D", color: "white" }}
          >
            <SlidersHorizontal />
            Filter
          </button>

          {/* Mobile Filters Overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/40 z-40 flex items-end lg:hidden">
              <div className="w-full bg-white rounded-t-2xl p-5 shadow-lg max-h-[65vh] overflow-y-auto mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#213E5A]">
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-900 hover:text-black focus:outline-none rounded-md p-1"
                  >
                    <span className="text-xl">✕</span>
                    <span className="sr-only">Close filters</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <SidebarFilters
                    categories={categories}
                    selectedCats={selectedCats}
                    setSelectedCats={setSelectedCats}
                    selectedSubcats={selectedSubcats}
                    setSelectedSubcats={setSelectedSubcats}
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                    min={min}
                    max={max}
                    setMin={setMin}
                    setMax={setMax}
                    initialMin={initialMinPrice}
                    initialMax={initialMaxPrice}
                  />
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleClearFilters();
                      setShowMobileFilters(false);
                    }}
                    className="w-full bg-gray-100 text-gray-700 font-medium text-sm px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-200 transition"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop filter header */}
          <div className="hidden lg:flex items-center gap-6 w-1/4">
            <div
              className="flex items-center gap-3 text-lg font-medium px-5 py-2.5 rounded-md w-full"
              style={{ backgroundColor: "#22365D", color: "white" }}
            >
              <SlidersHorizontal />
              Filter
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="bg-white  rounded-md border shadow-sm flex items-center text-sm">
              <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop sidebar filters */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
              <SidebarFilters
                categories={categories}
                selectedCats={selectedCats}
                setSelectedCats={setSelectedCats}
                selectedSubcats={selectedSubcats}
                setSelectedSubcats={setSelectedSubcats}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                min={min}
                max={max}
                setMin={setMin}
                setMax={setMax}
                initialMin={initialMinPrice}
                initialMax={initialMaxPrice}
              />
            </div>
            <button
              onClick={handleClearFilters}
              className="w-full flex justify-center items-center gap-3 text-lg font-medium px-5 py-2.5 rounded-md mt-4 text-white bg-black cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="lg:w-3/4 w-full">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <ProductList products={products} />
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 flex-wrap gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`cursor-pointer not-first:min-w-[36px] h-10 px-3 py-1.5 rounded-md text-sm font-medium border transition-all duration-200 ${
                      currentPage === i + 1
                        ? "bg-[#22365D] text-white border-[#22365D]"
                        : "bg-white text-[#22365D] border-gray-300 hover:bg-gray-100"
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
