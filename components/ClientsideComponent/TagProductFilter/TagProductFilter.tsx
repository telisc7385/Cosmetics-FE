"use client";

import React, { useEffect, useRef, useState } from "react";
import ProductCard from "@/components/CommonComponents/ProductCard/ProductCard";
import { Product } from "@/types/product";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

type Tag = {
  id: number;
  name: string;
};

const TagProductFilter = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        const res = await fetch(
          "https://cosmaticadmin.twilightparadox.com/product?product-tag"
        );
        const data = await res.json();

        if (Array.isArray(data.products)) {
          const tagMap = new Map<number, string>();
          data.products.forEach((product: any) => {
            product.tags?.forEach((tag: any) => {
              tagMap.set(tag.id, tag.name);
            });
          });

          const uniqueTags: Tag[] = Array.from(tagMap, ([id, name]) => ({
            id,
            name,
          }));
          setTags(uniqueTags);

          if (uniqueTags.length > 0) {
            setSelectedTagId(uniqueTags[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch tags", error);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    if (!selectedTagId) return;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await fetch(
          `https://cosmaticadmin.twilightparadox.com/product?tags=${selectedTagId}`
        );
        const data = await res.json();

        if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [selectedTagId]);

  // Ensure loop works even with few products
  const extendedProducts =
    products.length < 4 ? [...products, ...products] : products;

  return (
    <div className="max-w-7xl mx-auto px-1 md:px-0 py-6 space-y-6">
      <h2 className="text-2xl font-bold text-center">Shop by Tags</h2>

      {/* Tag Slider - Desktop */}
      <div className="w-full hidden md:flex justify-center">
        <div className="relative flex items-center w-full max-w-4xl">
          <button
            onClick={() => scroll("left")}
            className="z-10 text-[#213C66] bg-white shadow-md rounded-full p-1 absolute -left-3"
          >
            <FiChevronLeft size={20} />
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-3 px-10 hide-scrollbar w-full justify-center"
          >
            {loadingTags ? (
              <p>Loading tags...</p>
            ) : tags.length === 0 ? (
              <p>No tags found.</p>
            ) : (
              tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTagId(tag.id)}
                  className={`flex-shrink-0 rounded-xl px-6 py-2 text-sm font-semibold whitespace-nowrap min-w-[120px] text-center shadow-md transition-all duration-200 ${
                    selectedTagId === tag.id
                      ? "bg-[#1d325b] text-white"
                      : "bg-white text-black border border-black"
                  }`}
                >
                  {tag.name}
                </button>
              ))
            )}
          </div>

          <button
            onClick={() => scroll("right")}
            className="z-10 text-[#213C66] bg-white shadow-md rounded-full p-1 absolute -right-3"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Tag Slider - Mobile */}
      <div className="relative flex items-center justify-between md:hidden">
        <button onClick={() => scroll("left")} className="z-10 text-[#213C66]">
          <FiChevronLeft size={20} />
        </button>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-2 px-1 hide-scrollbar"
        >
          {loadingTags ? (
            <p>Loading tags...</p>
          ) : tags.length === 0 ? (
            <p>No tags found.</p>
          ) : (
            tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTagId(tag.id)}
                className={`flex-shrink-0 rounded-xl px-6 py-2 text-sm font-semibold whitespace-nowrap min-w-[120px] text-center shadow-md transition-all duration-200 ${
                  selectedTagId === tag.id
                    ? "bg-[#1d325b] text-white"
                    : "bg-white text-black border border-black"
                }`}
              >
                {tag.name}
              </button>
            ))
          )}
        </div>

        <button onClick={() => scroll("right")} className="z-10 text-[#213C66]">
          <FiChevronRight size={20} />
        </button>
      </div>

      {/* Product Slider */}
      <div className="relative">
        {loadingProducts ? (
          <p className="text-center">Loading products...</p>
        ) : selectedTagId && extendedProducts.length === 0 ? (
          <p className="text-center text-red-500">
            No products found for selected tag.
          </p>
        ) : (
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            loop={true}
            spaceBetween={8}
            slidesPerView={2}
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 10 },
              640: { slidesPerView: 3, spaceBetween: 10 },
              768: { slidesPerView: 3, spaceBetween: 10 },
              1024: { slidesPerView: 4, spaceBetween: 6 }, // reduced spacing for laptop
              1280: { slidesPerView: 5, spaceBetween: 10 },
            }}
            style={{ paddingBottom: "50px" }}
          >
            {extendedProducts.map((product, i) => (
              <SwiperSlide key={`${product.id}-${i}`}>
                <div className="px-1">
                  <ProductCard product={product} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        :global(.swiper-pagination-bullets) {
          bottom: -20px !important;
        }
        :global(.swiper-pagination-bullet) {
          background: #213c66;
          opacity: 0.6;
        }
        :global(.swiper-pagination-bullet-active) {
          background: #000;
        }
      `}</style>
    </div>
  );
};

export default TagProductFilter;
