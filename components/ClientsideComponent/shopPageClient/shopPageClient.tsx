"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Funnel } from "lucide-react";

import SidebarFiltersClient from "@/components/ServersideComponent/SidebarFilters/SidebarFilters";
import ProductCard from "@/components/CommonComponents/ProductCard/ProductCard";
import SortDropdown from "../SortDropdown.tsx/SortDropdown";

import { Category } from "@/types/category";
import { Product } from "@/types/product";

interface Props {
  categories: Category[];
}

type SortOrder = "price_asc" | "price_desc";

const PRODUCTS_PER_PAGE = 8;

const ShopPageClient: React.FC<Props> = ({ categories }) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    new Set()
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 3999]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<SortOrder>("price_asc");

  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  // Fetch all products once based on search and selected categories
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/product`);

      Array.from(selectedCategories).forEach((id) =>
        url.searchParams.append("category", id.toString())
      );

      if (search) {
        url.searchParams.append("search", search);
      }

      const res = await fetch(url.toString());
      const data = await res.json();

      const fetchedProducts = data.products || data.data?.products || [];
      setAllProducts(fetchedProducts);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, search]);

  const handleCategoryToggle = (id: number) => {
    setCurrentPage(1);
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Filter by price and category on frontend
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const price = Number(product.sellingPrice);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const matchesCategory =
        selectedCategories.size === 0 ||
        selectedCategories.has(product.category?.id ?? -1);

      return matchesPrice && matchesCategory;
    });
  }, [allProducts, priceRange, selectedCategories]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = Number(a.sellingPrice);
      const priceB = Number(b.sellingPrice);
      return sortOrder === "price_asc" ? priceA - priceB : priceB - priceA;
    });
  }, [filteredProducts, sortOrder]);

  // Paginate sorted products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return sortedProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);

  return (
    <div className="min-h-screen container mx-auto">
      <div className="w-full h-[250px] relative rounded overflow-hidden">
        <Image
          src="/shopPage2.jpg"
          alt="Shop Banner"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-1 py-2 px-4">
        <div className="bg-[#966ad7] border sm:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
          <h1 className="text-base flex gap-1 font-semibold text-white">
            <Funnel /> Filter
          </h1>
        </div>
        <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 px-4">
        {/* Sidebar Filters */}
        <SidebarFiltersClient
          categories={categories}
          selectedCategories={Array.from(selectedCategories)}
          onCategoryChange={handleCategoryToggle}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
        />

        {/* Main Content */}
        <div className="flex-1">
          {loading ? (
            <p>Loading products...</p>
          ) : paginatedProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

    
          {totalPages > 1 && (
            <div className="mt-6 flex gap-4 items-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPageClient;
