"use client";

import React from "react";
import { Product } from "@/types/product";
import ProductCard from "../CommonComponents/ProductCard/ProductCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface HotListClientProps {
  products: Product[];
}

const HotListClient = ({ products }: HotListClientProps) => {
  return (
    <section className="my-4 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold">Hot List</h2>
        <p className="text-sm text-gray-500">
          Check out the most popular and trending products right now.
        </p>

        <Swiper
          modules={[Autoplay, Pagination]}
          loop
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true, el: ".hotlist-client-pagination" }}
          spaceBetween={12}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
          className="mt-4"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination Dots */}
        <div className="hotlist-client-pagination mt-4 flex justify-center space-x-2" />
      </div>
    </section>
  );
};

export default HotListClient;
