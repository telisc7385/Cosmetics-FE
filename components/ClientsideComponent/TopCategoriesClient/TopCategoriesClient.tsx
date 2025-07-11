"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import ProductCard from "@/components/CommonComponents/ProductCard/ProductCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
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

  const handleCategoryClick = (id: number) => {
    if (id !== selectedId) {
      setSelectedId(id);
    }
  };

  return (
    <section className="py-10 max-w-7xl mx-auto bg-gray-50">
      <div className="px-4 md:px-10">
        <div className="mb-5 text-center">
          <h2 className="text-3xl font-bold mb-2 text-[#213C66]">
            Top Category Picks
          </h2>
          <p className="text-gray-600">
            Discover the best products from our top categories.
          </p>
          <hr className="my-4" />
        </div>

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
      </div>

      {loading && (
        <p className="text-gray-600 text-center mt-4">
          Loading products for selected category...
        </p>
      )}

      {!loading && filteredProducts.length === 0 && selectedId && (
        <p className="text-gray-500 text-center mt-4">
          No products found in this category.
        </p>
      )}

      {!loading && filteredProducts.length > 0 && (
        <div className="mt-6 px-4 md:px-10 relative">
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={2}
            spaceBetween={12}
            loop={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination-custom",
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
              1280: {
                slidesPerView: 5,
              },
            }}
          >
            {filteredProducts.map((product) => (
              <SwiperSlide key={product.id} className="py-4">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Pagination Dots Below Cards */}
          <div className="swiper-pagination-custom mt-4 flex justify-center space-x-2" />
        </div>
      )}
    </section>
  );
}
