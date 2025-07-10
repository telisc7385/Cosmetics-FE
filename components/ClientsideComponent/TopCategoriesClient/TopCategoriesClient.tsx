"use client";

import React, { useState, useEffect } from "react"; // Removed useRef
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import ProductCard from "../../CommonComponents/ProductCard/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
// Removed 'Swiper as SwiperCore' import as it was unused
// import { Swiper as SwiperCore } from "swiper/types";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";

type Props = {
  categories: Category[];
};

export default function TopCategoriesClient({ categories }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedId(categories[0].id);
    }
  }, [categories]);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (!selectedId) return;

      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("category", selectedId.toString());
        params.append("page", "1");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/category/id?${params.toString()}`
        );
        const json = await res.json();
        setFilteredProducts(json.data?.products || []);
      } catch (error) {
        console.error("Error fetching products by category:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [selectedId]);

  const handleCategoryClick = (id: number) => {
    if (id !== selectedId) {
      setSelectedId(id);
    }
  };

  return (
    <>
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: #ccc !important;
          opacity: 1 !important;
          margin: 0 4px !important;
        }
        .swiper-pagination-bullet-active {
          background-color: #213c66 !important;
        }
        .swiper-pagination {
          margin-top: 24px !important; /* Adds space between products and dots */
        }
      `}</style>

      <section className="py-10 px-4 md:px-10 bg-gray-50">
        <div className="max-w-[84rem] mx-auto">
          <div className="mb-5">
            <h2 className="text-3xl font-bold mb-2 text-[#213C66]">
              Top Category Picks
            </h2>
            <p className="text-gray-600">
              Discover the best products from our top categories.
            </p>
            <hr className="my-4" />
          </div>

          {/* Categories - Centered Buttons */}
          <div className="mb-6 flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-4 py-2 rounded-full transition cursor-pointer text-sm md:text-base ${
                  selectedId === category.id
                    ? "bg-[#213C66] text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Product Slider - All Devices */}
          {loading ? (
            <p className="text-gray-600 text-center">Loading products...</p>
          ) : filteredProducts.length > 0 ? (
            <>
              <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={20}
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                loop={true}
                breakpoints={{
                  0: { slidesPerView: 2 }, // Mobile: 2 products
                  640: { slidesPerView: 3 },
                  768: { slidesPerView: 4 },
                  1024: { slidesPerView: 5 },
                }}
                className="pb-4"
              >
                {filteredProducts.map((product) => (
                  <SwiperSlide key={product.id}>
                    <div className="py-4 px-2 mb-10">
                      <ProductCard product={product} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </>
          ) : (
            <p className="text-gray-500 text-center">
              No products found in this category.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
