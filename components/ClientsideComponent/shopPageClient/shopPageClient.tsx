"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import Image from "next/image";
import SidebarFiltersClient from "@/components/ServersideComponent/SidebarFilters/SidebarFilters";
import ProductCard from "@/components/CommonComponents/ProductCard/ProductCard";
import SortDropdown from "../SortDropdown.tsx/SortDropdown";
import { Funnel } from "lucide-react";

interface Props {
  categories: Category[];
}

type SortOrder = "price_asc" | "price_desc";

export default function ShopPageClient({ categories }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    new Set()
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 3999]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("price_asc");
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const itemsPerPage = 8;

  const handleCategoryChange = (id: number) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `${process.env.NEXT_PUBLIC_BASE_URL}/product`;

        if (selectedCategories.size > 0) {
          const categoryParam = Array.from(selectedCategories).join(",");
          url += url.includes("?")
            ? `&category=${categoryParam}`
            : `?category=${categoryParam}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        setProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, priceRange, sortOrder, searchQuery]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchQuery || product.name.toLowerCase().includes(searchQuery);
      const price = Number(product.sellingPrice);
      const inPriceRange = price >= priceRange[0] && price <= priceRange[1];
      return matchesSearch && inPriceRange;
    });
  }, [products, searchQuery, priceRange]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = Number(a.sellingPrice);
      const priceB = Number(b.sellingPrice);
      return sortOrder === "price_asc" ? priceA - priceB : priceB - priceA;
    });
  }, [filteredProducts, sortOrder]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  return (
    <div className="min-h-screen">
      <div className="w-full h-[250px] relative">
        <Image
          src="/shopPage2.jpg"
          alt="Shop Banner"
          fill
          className="object-cover rounded"
        />
      </div>

      <div className="mt-6 px-4 flex flex-col gap-4">
        {/* Header: Filter button (for mobile) and Sort dropdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="bg-[#966ad7] border sm:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
            <h1 className="text-base flex gap-1 font-semibold text-white">
              <Funnel />
              <span>Filter</span>
            </h1>
          </div>
          <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
        </div>

        {searchQuery && (
          <div className="flex items-center justify-between mt-2 flex-wrap">
            <p className="text-sm text-gray-600">
              Showing results for: <strong>{searchQuery}</strong>
            </p>
            <button
              onClick={() => router.push("/shop")}
              className="text-sm text-blue-500 underline"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Main content layout */}
        <div className="flex flex-col lg:flex-row gap-4">
          <SidebarFiltersClient
            categories={categories}
            selectedCategories={Array.from(selectedCategories)}
            onCategoryChange={handleCategoryChange}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
          />

          <div className="flex-1 flex flex-col min-h-[500px] justify-between">
            {loading ? (
              <div className="text-center mt-10 text-gray-500">
                Loading products...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500">
                    No products found.
                  </p>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2 flex-wrap">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === index + 1 ? "bg-[#966ad7] text-white" : ""
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
