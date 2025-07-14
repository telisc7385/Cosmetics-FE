"use client";

import React, { useState, useEffect, useRef } from "react";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import ProductCard from "@/components/CommonComponents/ProductCard/ProductCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules"; // Only Autoplay and Pagination needed
import "swiper/css";
import "swiper/css/pagination";
import SectionHeader from "@/components/CommonComponents/SectionHeader";

type Props = {
  categories: Category[];
};

export default function TopCategoriesClient({ categories }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedId(categories[0].id);
    }
  }, [categories]);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (!selectedId) {
        setFilteredProducts([]);
        return;
      }

      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("category", selectedId.toString());
        params.append("page", "1");
        params.append("limit", "20");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/category/id?${params.toString()}`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.statusText}`);
        }

        const json = await res.json();
        setFilteredProducts(json.data?.products || []);
      } catch (error) {
        console.error("Error fetching products by category:", error);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [selectedId]);

  useEffect(() => {
    // Update underline position when selectedId changes or on resize
    const updateUnderline = () => {
      if (activeTabRef.current && underlineRef.current) {
        const { offsetLeft, clientWidth } = activeTabRef.current;
        underlineRef.current.style.transform = `translateX(${offsetLeft}px)`;
        underlineRef.current.style.width = `${clientWidth}px`;
      }
    };

    updateUnderline(); // Initial position
    window.addEventListener("resize", updateUnderline); // Update on resize
    return () => window.removeEventListener("resize", updateUnderline);
  }, [selectedId, categories]);

  const handleCategoryClick = (id: number) => {
    if (id !== selectedId) {
      setSelectedId(id);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background radial light effect - This remains full width */}
      <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50/70 via-white to-white"></div>

      {/* Main Container for all content except the full-width background */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center">
          <SectionHeader
            title="Our Signature Collections"
            subtitle=" Immerse yourself in our meticulously curated beauty collections,
            designed to inspire and enhance your natural radiance."
            titleClass="text-2xl sm:text-3xl lg:text-4xl"
            subtitleClass="text-sm sm:text-base lg:text-lg"
          />
        </div>

        {/* Category Navigation - Animated Underline Tabs with Scroll Indicator */}
        <div className=" relative">
          <div className="relative">
            {/* Container for scrollable tabs and gradients */}
            <div className="flex flex-nowrap overflow-x-auto justify-start  sm:justify-center py-2 px-1 -mx-2 scrollbar-hide snap-x snap-mandatory">
              {" "}
              {/* Removed border-b border-gray-200 */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  ref={selectedId === category.id ? activeTabRef : null}
                  className={`flex-shrink-0 mx-2 px-6 py-3 hover:cursor-pointer transition-colors duration-300 text-base sm:text-lg font-medium whitespace-nowrap relative group snap-center
                    ${
                      selectedId === category.id
                        ? "text-[#213E5A]"
                        : "text-gray-600 hover:text-[#213E5A]/80"
                    }`}
                >
                  {category.name}
                  {/* Active category underline */}
                  {selectedId === category.id && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 bg-white opacity-70 transition-all duration-300 transform scale-x-100 group-hover:scale-x-125"></span>
                  )}
                </button>
              ))}
              {/* Animated Underline */}
              <span
                ref={underlineRef}
                className="absolute bottom-0 h-1 bg-[#213E5A] transition-all duration-300 ease-in-out rounded-full"
                style={{
                  left: 0,
                  width: 0,
                }}
              ></span>
            </div>
            {/* Scroll indicators for mobile only */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent sm:hidden pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent sm:hidden pointer-events-none"></div>
          </div>
        </div>

        {/* Loading/No Products State */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-600">
            <svg
              className="animate-spin h-12 w-12 text-[#213E5A] mb-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-center text-2xl font-medium animate-pulse">
              Summoning the magic... please wait! 🪄
            </p>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && selectedId && (
          <div className="min-h-[300px] flex flex-col items-center justify-center text-gray-500 text-xl font-medium">
            <p className="">
              This collection is awaiting its star products! ✨
            </p>
            <p className="text-base text-gray-400">
              Check back soon for exquisite additions.
            </p>
          </div>
        )}

        {/* Product Carousel */}
        {!loading && filteredProducts.length > 0 && (
          <div className="mt-12 relative pb-10">
            <Swiper
              modules={[Autoplay, Pagination]} // Only Autoplay and Pagination needed
              slidesPerView={2}
              spaceBetween={20}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
                el: ".swiper-pagination-custom",
                bulletClass: "swiper-pagination-bullet-custom",
                bulletActiveClass: "swiper-pagination-bullet-custom-active",
              }}
              breakpoints={{
                320: {
                  slidesPerView: 2,
                  spaceBetween: 16,
                },
                640: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 32,
                },
                1280: {
                  slidesPerView: 5,
                  spaceBetween: 32,
                },
              }}
              className="px-2 py-10"
            >
              {filteredProducts.map((product) => (
                <SwiperSlide key={product.id} className="my-2">
                  {" "}
                  {/* Added my-4 here */}
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Pagination Dots Below Cards */}
            <div className="swiper-pagination-custom absolute bottom-0 left-0 right-0 flex justify-center space-x-3">
              {/* Swiper will render the dots here with custom classes */}
            </div>
            {/* Removed Custom Navigation Arrows for Product Carousel */}
          </div>
        )}
      </div>
    </section>
  );
}
