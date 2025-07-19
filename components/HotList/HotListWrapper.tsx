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
    <section className="w-full mt-4 md:mt-8 ">
      <div className="max-w-7xl mx-auto p-4">
        <SectionHeader
          title="Hot List"
          subtitle="Out the most popular and trending products."
          titleClass="text-2xl sm:text-3xl lg:text-4xl"
          subtitleClass="text-sm sm:text-base lg:text-lg"
        />

        <div className="relative mt-4 md:mt-8">
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
            className="relative mb-6"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id} className="py-0 my-2">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="swiper-pagination-custom absolute bottom-0 left-0 right-0 flex justify-center space-x-3" />
        </div>
      </div>
    </section>
  );
}
