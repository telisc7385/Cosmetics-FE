"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "@/types/product";
import ProductCard from "../CommonComponents/ProductCard/ProductCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { CircleChevronLeft, CircleChevronRight } from "lucide-react";

interface HotListClientProps {
  products: Product[];
}

const HotListClient = ({ products }: HotListClientProps) => {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const [swiperReady, setSwiperReady] = useState(false);

  // Make sure navigation refs are ready
  useEffect(() => {
    setSwiperReady(true);
  }, []);

  return (
    <section className="my-4 px-4 sm:px-10">
      <div className="max-w-[80rem] mx-auto">
        <h2 className="text-xl font-bold mb-2">Hot List</h2>
        <p className="text-sm text-gray-500 mb-4">
          Check out the most popular and trending products right now.
        </p>

        <div className="relative">
          {/* Arrows only for desktop */}
          <div className="hidden md:flex justify-between absolute top-1/2 left-0 right-0 -translate-y-1/2 px-4 z-10">
            <button
              ref={prevRef}
              className="bg-white shadow p-2 rounded-full hover:bg-gray-100"
            >
              <CircleChevronLeft size={30} />
            </button>
            <button
              ref={nextRef}
              className="bg-white shadow p-2 rounded-full hover:bg-gray-100"
            >
              <CircleChevronRight size={30} />
            </button>
          </div>

          {/* Swiper Slider */}
          {swiperReady && (
            <Swiper
              key={"hotlist-swiper"} // ensures rerender
              modules={[Autoplay, Pagination, Navigation]}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              loop={true}
              navigation={{
                prevEl: prevRef.current!,
                nextEl: nextRef.current!,
              }}
              onBeforeInit={(swiper) => {
                if (
                  swiper.params.navigation &&
                  typeof swiper.params.navigation !== "boolean"
                ) {
                  swiper.params.navigation.prevEl = prevRef.current!;
                  swiper.params.navigation.nextEl = nextRef.current!;
                }
              }}
              spaceBetween={20}
              pagination={{ clickable: true }}
              breakpoints={{
                0: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
              className="pb-10"
            >
              {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <div className="py-4 px-2">
                    <ProductCard product={product} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* Custom Dots */}
          <style jsx global>{`
            .swiper-pagination-bullet {
              background-color: #ccc;
              opacity: 1;
              margin: 0 6px;
            }
            .swiper-pagination-bullet-active {
              background-color: #213c66;
            }
          `}</style>
        </div>
      </div>
    </section>
  );
};

export default HotListClient;
