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
import Loader from "@/utils/Loader";

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
    <section className="w-full mt-6 md:mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <SectionHeader
            title={type === "category" ? "Our Signature Collections" : "Shop by Tags"}
            subtitle="Immerse yourself in our meticulously curated beauty collections, designed to inspire and enhance your natural radiance."
            titleClass="text-2xl sm:text-3xl lg:text-4xl"
            subtitleClass="text-sm sm:text-base lg:text-lg"
          />
        </div>

        {/* Category Tabs */}
        <motion.div className="relative mt-6 md:mt-10">
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white/80 to-transparent pointer-events-none z-10 sm:hidden" />
          <motion.div
            className="flex overflow-x-auto scrollbar-hide justify-start sm:justify-center space-x-3 sm:space-x-4 px-1 snap-x snap-mandatory"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {categories?.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm sm:text-base font-semibold transition-colors duration-300 shadow-sm border ${
                  selectedId === category.id
                    ? "bg-[#22365D] text-white border-[#22365D]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#22365D] hover:text-[#22365D]"
                }`}
                variants={{
                  hidden: { opacity: 0, x: 100 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
                }}
              >
                {category.name}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Loader */}
        {loading && <Loader />}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && selectedId && (
          <div className="min-h-[300px] flex flex-col items-center justify-center text-gray-500 text-xl font-medium">
            <p>This collection is awaiting its star products! ✨</p>
            <p className="text-base text-gray-400">Check back soon for exquisite additions.</p>
          </div>
        )}

        {/* Product Swiper */}
        <AnimatePresence mode="wait">
          {!loading && filteredProducts.length > 0 && (
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6 }}
              className="relative pt-10 pb-6"
            >
              <Swiper
                modules={[Autoplay, Pagination]}
                loop
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{
                  clickable: true,
                  el: ".swiper-pagination-custom",
                  bulletClass: "swiper-pagination-bullet-custom",
                  bulletActiveClass: "swiper-pagination-bullet-custom-active",
                }}
                breakpoints={{
                  320: { slidesPerView: 2, spaceBetween: 12 },
                  640: { slidesPerView: 3, spaceBetween: 16 },
                  1024: { slidesPerView: 4, spaceBetween: 20 },
                  1280: { slidesPerView: 5, spaceBetween: 24 },
                }}
              >
                {filteredProducts.map((product, index) => (
                  <SwiperSlide key={product.id} className="mb-8">
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

              <div className="swiper-pagination-custom mt-6 flex justify-center" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
