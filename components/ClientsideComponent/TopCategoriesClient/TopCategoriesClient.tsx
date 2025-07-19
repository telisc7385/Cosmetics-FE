"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import ProductCard from "@/components/CommonComponents/ProductCard/ProductCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import SectionHeader from "@/components/CommonComponents/SectionHeader";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  categories: Category[];
  type: string;
};

export default function TopCategoriesClient({ categories, type }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (categories && categories?.length > 0) {
      setSelectedId(categories[0].id);
    }
  }, [categories]);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (!selectedId) return;

      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (type === "category") {
          params.append("category", selectedId.toString());
        } else {
          params.append("tags", selectedId.toString());
        }
        params.append("page", "1");
        params.append("limit", "20");
        params.append("is_active", true.toString());

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/product?${params.toString()}`
        );
        const json = await res.json();
        console.log("json", json)
        setFilteredProducts(json?.products || []);
      } catch (error) {
        console.error("Error fetching products by category:", error);
        setFilteredProducts([]);
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
    <section className="p-2 md:p-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-4">
        {type === "category" ?
          <div className="text-center">
            <SectionHeader
              title="Our Signature Collections"
              subtitle="Immerse yourself in our meticulously curated beauty collections, designed to inspire and enhance your natural radiance."
              titleClass="text-2xl sm:text-3xl lg:text-4xl"
              subtitleClass="text-sm sm:text-base lg:text-lg"
            />
          </div> :
          <div className="text-center">
            <SectionHeader
              title="Shop by Tags"
              subtitle="Immerse yourself in our meticulously curated beauty collections, designed to inspire and enhance your natural radiance."
              titleClass="text-2xl sm:text-3xl lg:text-4xl"
              subtitleClass="text-sm sm:text-base lg:text-lg"
            />
          </div>
        }

        {/* Category Tabs with Animation */}
        <motion.div
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white/80 to-transparent pointer-events-none z-10 sm:hidden" />

          <motion.div
            className="flex flex-nowrap overflow-x-auto scrollbar-hide justify-start sm:justify-center py-2 px-1 -mx-1 snap-x snap-mandatory"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {categories && categories?.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex-shrink-0 mx-1 px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap relative group snap-center rounded-md transition-colors duration-300 ${selectedId === category.id
                  ? "bg-[#22365D] text-[#F8F8F8]"
                  : "bg-transparent text-gray-600 hover:text-[#22365D]"
                  }`}
                variants={{
                  hidden: { opacity: 0, x: 100 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.5 },
                  },
                }}
              >
                {category.name}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Loading Spinner */}
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-center text-2xl font-medium animate-pulse">
              Summoning the magic... please wait! 🪄
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && selectedId && (
          <div className="min-h-[300px] flex flex-col items-center justify-center text-gray-500 text-xl font-medium">
            <p>This collection is awaiting its star products! ✨</p>
            <p className="text-base text-gray-400">
              Check back soon for exquisite additions.
            </p>
          </div>
        )}

        {/* Product Cards with Swiper & Animation */}
        <AnimatePresence mode="wait">
          {!loading && filteredProducts.length > 0 && (
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6 }}
              className="relative pb-6"
            >
              <Swiper
                modules={[Autoplay, Pagination]}
                slidesPerView={2}
                spaceBetween={16}
                loop={true}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                pagination={{
                  clickable: true,
                  el: ".swiper-pagination-custom",
                  bulletClass: "swiper-pagination-bullet-custom",
                  bulletActiveClass: "swiper-pagination-bullet-custom-active",
                }}
                breakpoints={{
                  320: { slidesPerView: 2, spaceBetween: 16 },
                  640: { slidesPerView: 3, spaceBetween: 16 },
                  1024: { slidesPerView: 4, spaceBetween: 16 },
                  1280: { slidesPerView: 5, spaceBetween: 16 },
                }}
                className="px-2 py-10"
              >
                {filteredProducts.map((product, index) => (
                  <SwiperSlide key={product.id} className="my-2">
                    <motion.div
                      initial={{ opacity: 0, y: 60 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: false }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="swiper-pagination-custom absolute bottom-0 left-0 right-0 flex justify-center space-x-3" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
