"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Image from "next/image";
import { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
};

type Props = {
  testimonials: Testimonial[];
  title: string;
  subtitle: string;
};

export default function TestimonialSlider({ testimonials }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className="relative w-full overflow-hidden">
      {/* ✅ Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/testimonialbg2.jpg" // 🔁 Replace with your image path
          alt="Testimonial Background"
          fill
          className="object-cover object-center"
        />
        {/* ✅ Overlay with soft tint */}
        <div className="absolute inset-0 bg-[#F7EFE0] opacity-0 z-10" />
      </div>

      {/* ✅ Swiper Content */}
      <div className="relative z-20 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-10">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            centeredSlides
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            onSwiper={(swiperInstance) => (swiperRef.current = swiperInstance)}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            loop
          >
            {testimonials.map((t, index) => (
              <SwiperSlide key={t.id}>
                <div
                  className={`
                    transition-transform duration-300 ease-in-out bg-white rounded-xl shadow-md p-4 sm:p-6 mx-auto my-4
                    max-w-[85%] sm:max-w-md
                    ${
                      index === activeIndex
                        ? "scale-105 sm:scale-110"
                        : "scale-95 sm:scale-90"
                    }
                    h-[220px] sm:h-[250px] overflow-hidden
                  `}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={t.image}
                      alt={t.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-lg text-black">{t.name}</h4>
                      <p className="text-sm text-gray-500">{t.role}</p>
                    </div>
                  </div>
                  <div
                    className={`
                      text-gray-700 text-sm overflow-y-auto pr-1
                      max-h-[90px]
                      [-ms-overflow-style:none] [scrollbar-width:none]
                      [&::-webkit-scrollbar]:hidden
                      sm:max-h-[100px]
                    `}
                  >
                    {t.description}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
