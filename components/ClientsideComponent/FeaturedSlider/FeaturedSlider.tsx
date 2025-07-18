"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { motion } from "framer-motion";
import { useState } from "react";

export default function FeaturedSlider({ products }: { products: Product[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative w-full overflow-hidden">
      {/* ✅ Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/testimonialbg.png"
          alt="Featured Background"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#F7EFE0] opacity-40 z-10" />
      </div>

      {/* ✅ Swiper content */}
      <div className="relative z-20 py-4 px-3 sm:px-4 lg:px-6">
        <div className="max-w-6xl mx-auto">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            autoplay={{ delay: 5000 }}
            loop
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          >
            {products.map((product, idx) => {
              const isEven = idx % 2 === 0;

              const imageInitial = { opacity: 0, x: isEven ? 60 : -60 };
              const imageAnimate = {
                opacity: activeIndex === idx ? 1 : 0,
                x: activeIndex === idx ? 0 : imageInitial.x,
              };

              const textInitial = { opacity: 0, x: isEven ? -60 : 60 };
              const textAnimate = {
                opacity: activeIndex === idx ? 1 : 0,
                x: activeIndex === idx ? 0 : textInitial.x,
              };

              return (
                <SwiperSlide key={product.id}>
                  <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 min-h-[320px] lg:min-h-[300px] px-2">
                    {/* ✅ IMAGE */}
                    <motion.div
                      initial={imageInitial}
                      animate={imageAnimate}
                      transition={{ duration: 0.7 }}
                      className="relative w-full lg:w-1/2 flex justify-center"
                    >
                      <Image
                        src={product.images[0]?.image || "/placeholder.jpg"}
                        alt={product.name}
                        width={280}
                        height={280}
                        className="rounded w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] lg:w-[280px] lg:h-[280px] object-contain"
                      />
                    </motion.div>

                    {/* ✅ TEXT */}
                    <motion.div
                      initial={textInitial}
                      animate={textAnimate}
                      transition={{ duration: 0.7 }}
                      className="w-full lg:w-1/2 text-center lg:text-left"
                    >
                      <p className="text-xs sm:text-sm text-[#213e5a]">
                        {product.category?.name}
                      </p>
                      <h3 className="text-lg sm:text-xl text-[#213e5a] font-bold mt-1">
                        {product.name}
                      </h3>
                      <p className="text-[#e60076] font-semibold text-base sm:text-lg mt-2">
                        ₹{product.basePrice}
                        <span className="line-through text-gray-500 text-xs ml-2">
                          ₹{product.sellingPrice}
                        </span>
                      </p>

                      <p
                        className="mt-2 text-gray-700 text-xs sm:text-sm"
                        dangerouslySetInnerHTML={{
                          __html: product.description,
                        }}
                      ></p>
                      <p className="text-xs sm:text-sm text-green-700 mt-1">
                        ● In Stock ({product.stock} available)
                      </p>
                      <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-center lg:justify-start">
                        <Link
                          href={`/product/${product.slug}`}
                          className="px-3 py-1.5 text-sm border text-gray-600 rounded hover:bg-gray-100 text-center"
                        >
                          Details →
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
