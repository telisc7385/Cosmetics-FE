"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import ProductCard from "@/components/CommonComponents/ProductCard/ProductCard";
import SortDropdown from "@/components/ClientsideComponent/SortDropdown/SortDropdown";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

interface Props {
  category: Category;
  initialProducts: Product[];
  initialPage: number;
  totalPagesFromServer: number;
}

type SortOrder = "" | "price_asc" | "price_desc";

export default function CategoryInfo({
  category,
  initialProducts,
  initialPage,
  totalPagesFromServer,
}: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [totalPages, setTotalPages] = useState(totalPagesFromServer || 1);

  const sortOrder = (searchParams.get("sort") ?? "") as SortOrder;
  const currentPage = parseInt(
    searchParams.get("page") ?? initialPage.toString(),
    10
  );
  const limit = 4;

  const handleSortChange = (value: SortOrder) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("sort", value);
    newParams.set("page", "1");
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("page", page.toString());
    router.push(`${pathname}?${newParams.toString()}`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const base = process.env.NEXT_PUBLIC_BASE_URL;
      const sortParam =
        sortOrder === "price_asc"
          ? "selling_price"
          : sortOrder === "price_desc"
            ? "-selling_price"
            : "";

      const url = `${base}/product?page=${currentPage}&limit=${limit}&category=${category.id
        }${sortParam ? `&sort=${sortParam}` : ""}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages ?? 1);
      } catch (error) {
        console.error("Error fetching sorted/paginated products:", error);
      }
    };

    fetchProducts();
  }, [category.id, sortOrder, currentPage]);

  // const activeProducts = products.filter((product) => product.isActive)
  // console.log("Active Products:", activeProducts);
  return (
    <div className="w-full bg-white">
      {/* Banner */}
      <div className="relative w-full h-[220px] sm:h-[350px] lg:h-[350px] overflow-hidden mx-auto">
        {category.banner ? (
          <>
            <Image
              src={category.banner}
              alt={category.name}
              fill
              className="object-cover w-full h-full"
              priority
            />
            {/* <div className="absolute inset-0 bg-black/30" /> */}
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Banner Available
          </div>
        )}
      </div>

      <div className="container mx-auto lg:flex lg:flex-col lg:items-center">
        {/* Description */}
        <section className="w-full px-4 py-6 mt-2 sm:mt-3 lg:flex lg:justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 relative overflow-hidden lg:w-[90%]">
            <div className="absolute top-0 left-0 w-24 h-24 bg-orange-100 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-orange-100 rounded-full opacity-30 translate-x-1/2 translate-y-1/2" />
            <h2 className="text-[#213E5A] text-2xl font-semibold mb-4">
              {category.name}
            </h2>
            <p className="text-[#213E5A] text-lg leading-relaxed">
              {category.description ||
                "Discover premium, handpicked products tailored to your needs in this category."}
            </p>
          </div>
        </section>

        {/* Breadcrumb and Sort */}
        <div className="w-full px-4 lg:flex lg:justify-between lg:items-center lg:w-[90%]">
          <h3 className="pt-4 pb-2 text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Link
              href="/shop"
              className="text-blue-600 hover:text-blue-800 underline underline-offset-4 transition-colors duration-200"
            >
              All Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">{category.name}</span>
          </h3>

          <div className="mb-2 lg:mb-0">
            <SortDropdown
              sortOrder={sortOrder}
              setSortOrder={handleSortChange}
            />
          </div>
        </div>

        {/* Product Grid */}
        <section className="px-4 pb-10 w-full lg:flex lg:justify-center">
          {products.length === 0 ? (
            <div className="bg-white border p-6 rounded shadow text-center text-gray-500 w-full lg:w-[90%]">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full lg:w-[90%]">
              {products.map((product) => (

                <div key={product.id} className="w-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 border rounded text-sm transition ${currentPage === i + 1
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
  );
}
