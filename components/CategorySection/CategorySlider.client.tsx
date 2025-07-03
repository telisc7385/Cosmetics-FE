"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  imageUrl: string;
}

interface Props {
  categories: Category[];
}
const bgColors = ["#e6ffe6", "#cce0ff", "#ffb3b3", "#CCE6FF", "#FFCCCC"];

export default function CategorySlider({ categories }: Props) {
  return (
    <div className="container mx-auto  px-4 pb-6">
      <Swiper
        spaceBetween={24}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        navigation={true}
        modules={[Navigation, Autoplay]}
        breakpoints={{
          640: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 5,
          },
        }}
      >
        {categories.map((cat, index) => (
          <SwiperSlide key={cat.id}>
              <Link href={`/category/${cat.id}`} passHref>
            <div className="flex-shrink-0 w-[260px] h-[420px] bg-white rounded-lg group cursor-pointer relative overflow-hidden transition-all duration-300 mx-auto">
              {/* 🔵 Background Bubble */}
              <div
                className={`
                  absolute
                  bottom-[80px]
                  left-1/2
                  -translate-x-1/2
                  z-0
                  w-[220px] 
                  h-[120px]
                  rounded-sm
                  transition-all duration-500 ease-in-out
                  group-hover:w-[260px] 
                  group-hover:h-[180px]
                  group-hover:rounded-[10px]
                `}
                style={{
                  backgroundColor: bgColors[index % bgColors.length],
                }}
              />

              {/* 🖼 Main Image (zoom + shadow only on image) */}
              <div className="relative z-10 flex justify-center h-[300px] sm:h-[280px] items-start pt-6">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  width={280}
                  height={280}
                  className="object-contain transition-transform duration-500 group-hover:scale-115 group-hover:drop-shadow-lg"
                />
              </div>

              {/* 🔤 Category Name */}
              <h3 className="relative z-10 mt-20 text-center text-base font-semibold text-black">
                {cat.name}
              </h3>
              </div>
              </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
