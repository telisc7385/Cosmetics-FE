"use client";

import React, { useState, useEffect, useRef } from "react";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import ProductCard from "../../CommonComponents/ProductCard/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper as SwiperCore } from "swiper/types";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
import "swiper/css/pagination";

type Props = {
  categories: Category[];
};

export default function TopCategoriesClient({ categories }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const swiperRef = useRef<SwiperCore | null>(null);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedId(categories[0].id); // default select first category
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
        console.log("Fetched response:", json);

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
      {/* Custom Global Styles for Swiper Pagination Dots (Product Slider) */}
      <style jsx global>{`
        /* Common styles for all Swiper pagination dots (now only applies to product slider) */
        .swiper-pagination-bullet {
          background-color: #ccc !important;
          opacity: 1 !important;
          margin: 0 4px !important;
        }
        .swiper-pagination-bullet-active {
          background-color: #213e5a !important;
        }

        /* Ensure pagination dots are positioned correctly and not hidden */
        .swiper-pagination {
          position: relative !important;
          bottom: auto !important;
          top: auto !important;
          margin-top: 15px; /* Space between slides and dots */
        }
      `}</style>

      <section className="py-8 px-4 md:px-10 bg-gray-50">
        <div className="max-w-[84rem] mx-auto">
          <div className="mb-5">
            <h2 className="text-3xl font-bold mb-2">Top Category Picks</h2>
            <p className="text-gray-600">
              Discover the best products from our top categories.
            </p>
            <hr className="my-4" />
          </div>

          {/* --- START: Laptop View Container (visible from md breakpoint up) --- */}
          <div className="hidden md:block">
            {/* Laptop View: Regular buttons for categories */}
            <div className="mb-6">
              {/* Removed 'hidden' from md:flex as parent 'hidden md:block' now controls visibility */}
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`px-4 py-2 rounded-full transition cursor-pointer ${
                      selectedId === category.id
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Laptop View for Products */}
            {loading ? (
              <p className="text-gray-600">Loading products...</p>
            ) : filteredProducts.length > 0 ? (
              // Removed 'hidden' from lg:grid as parent 'hidden md:block' now controls visibility
              <div className="lg:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="py-4 px-2">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No products found in this category.
              </p>
            )}
          </div>
          {/* --- END: Laptop View Container --- */}

          {/* --- START: Mobile/Tablet View Container (visible only below md breakpoint) --- */}
          <div className="md:hidden">
            {/* Mobile View: Swiper slider for categories */}
            <div className="mb-6">
              <div className="flex items-center justify-between max-w-sm mx-auto px-4 space-x-8">
                {/* Custom Left Arrow Button */}
                <button
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="p-2 rounded-full text-[#213E5A] hover:bg-gray-200 focus:outline-none"
                >
                  &#8249; {/* Left chevron HTML entity */}
                </button>

                {/* Swiper for the category buttons */}
                <div className="flex-1 min-w-0">
                  <Swiper
                    onSwiper={(swiper) => (swiperRef.current = swiper)}
                    modules={[Autoplay]}
                    slidesPerView={"auto"}
                    spaceBetween={24}
                    slidesPerGroup={1}
                    loop={true}
                    className="myCategorySwiper pb-4"
                  >
                    {categories.map((category) => (
                      <SwiperSlide
                        key={category.id}
                        className="flex justify-center"
                      >
                        <button
                          onClick={() => handleCategoryClick(category.id)}
                          className={`
                            py-1
                            px-2
                            rounded-xl transition cursor-pointer whitespace-nowrap text-center text-sm
                            ${
                              selectedId === category.id
                                ? "bg-[#213E5A] text-white"
                                : "bg-white border-2 border-[#213E5A] text-[#213E5A]"
                            }
                          `}
                        >
                          {category.name}
                        </button>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* Custom Right Arrow Button */}
                <button
                  onClick={() => swiperRef.current?.slideNext()}
                  className="p-2 rounded-full text-[#213E5A] hover:bg-gray-200 focus:outline-none"
                >
                  &#8250; {/* Right chevron HTML entity */}
                </button>
              </div>
            </div>

            {/* Mobile/Tablet View for Products */}
            {loading ? (
              <p className="text-gray-600">Loading products...</p>
            ) : filteredProducts.length > 0 ? (
              // Removed 'lg:hidden' from here as parent 'md:hidden' now controls visibility
              <div className="">
                <Swiper
                  modules={[Autoplay, Pagination]}
                  navigation={false}
                  spaceBetween={20}
                  slidesPerView={2}
                  pagination={{ clickable: true }}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  className="pb-4"
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                  }}
                >
                  {filteredProducts.map((product) => (
                    <SwiperSlide key={product.id}>
                      <div className="py-4 px-2 mx-auto">
                        <ProductCard product={product} />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <p className="text-gray-500">
                No products found in this category.
              </p>
            )}
          </div>
          {/* --- END: Mobile/Tablet View Container --- */}
        </div>
      </section>
    </>
  );
}
