"use client";

import { useEffect, useState } from "react";
import { getNewArrivalProducts } from "@/api/fetchNewArrivalProducts";
import { Product } from "@/types/product";
import ProductCard from "../CommonComponents/ProductCard/ProductCard";
import SectionHeader from "../CommonComponents/SectionHeader";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";

export default function HotListWrapper() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewArrivalProducts()
      .then((res) => setProducts(res || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 text-lg">
        No new arrival products found.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ✅ Floating Decorative Image at top-right, outside container */}
      <div className="absolute -top-20 my-6 right-0 z-10 hidden md:block">
        <Image
          src="/flowerDecor.png" // 🔁 Replace with your actual image path
          alt="Hotlist Decoration"
          width={220}
          height={220}
          className="object-contain"
        />
      </div>

      <div className="px-4 md:px-12 mb-10 my-6 max-w-7xl mx-auto">
        <SectionHeader
          title="Hot List"
          subtitle="Out the most popular and trending products."
        />

        <Swiper
          modules={[Autoplay, Pagination]}
          loop={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          pagination={{
            clickable: true,
            el: ".hotlist-pagination",
          }}
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 5 },
          }}
          className="py-4"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="py-0 my-2">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="hotlist-pagination mt-4 flex justify-center space-x-2" />
      </div>
    </div>
  );
}
