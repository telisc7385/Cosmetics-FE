"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import ProductCard from "../../CommonComponents/ProductCard/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

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

        /* Custom styling for SwiperSlide on mobile to control card size */
        @media (max-width: 639px) {
          .swiper-slide-product-card-mobile {
            /* Now, the available width for two cards is (viewport width - 2 * slidesOffsetBefore/After - spaceBetween) */
            /* So, (100% of parent width - (2 * 16px offset) - 10px spaceBetween) / 2 */
            /* This works out to (100vw - 32px - 10px) / 2 = (100vw - 42px) / 2 = 50vw - 21px */
            /* Since the Swiper itself has the offset, the calc() needs to fit within Swiper's inner width */
            /* The actual width calculation for calc(50% - 2px) is correct relative to Swiper's internal width,
               which is now padded by slidesOffsetBefore/After. */
            width: calc(50% - 5px) !important;
          }
        }
      `}</style>

      <section className="py-10 max-w-7xl mx-auto bg-gray-50">
        <div className="px-4 md:px-10">
          {" "}
          {/* Text and buttons maintain px-4 padding */}
          <div className="mb-5">
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

        {loading ? (
          <p className="text-gray-600 text-center">Loading products...</p>
        ) : filteredProducts.length > 0 ? (
          <>
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={0}
              pagination={{ clickable: true }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              loop={true}
              breakpoints={{
                // Mobile (0px to 639px): Add 16px space on left and right for cards
                0: {
                  slidesPerView: 2,
                  slidesPerGroup: 2,
                  centeredSlides: false,
                  // ADDED PADDING TO THE SIDES OF THE CARDS FOR MOBILE VIEW
                  slidesOffsetBefore: 16, // Adds 16px space before the first card
                  slidesOffsetAfter: 16, // Adds 16px space after the last card
                },
                // Tablet (640px and up): Revert to 3 slides, original padding (relative to max-w-7xl)
                640: {
                  slidesPerView: 3,
                  slidesOffsetBefore: 40,
                  slidesOffsetAfter: 40,
                  slidesPerGroup: 1,
                },
                768: {
                  slidesPerView: 4,
                  slidesOffsetBefore: 40,
                  slidesOffsetAfter: 40,
                },
                1024: {
                  slidesPerView: 5,
                  slidesOffsetBefore: 40,
                  slidesOffsetAfter: 40,
                },
              }}
              className="pb-4"
            >
              {filteredProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <div className="py-4  mb-10 swiper-slide-product-card-mobile">
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
      </section>
    </>
  );
}
