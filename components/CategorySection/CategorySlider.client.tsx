// components/CategorySlider.client.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import SectionHeader from "../CommonComponents/SectionHeader"; // Adjust path if necessary

interface Category {
  slug: any;
  id: number;
  name: string;
  imageUrl: string;
}

interface Props {
  categories: Category[];
}

// const bgColors = ["#e6ffe6", "#cce0ff", "#ffb3b3", "#CCE6FF", "#FFCCCC"];

const bgColors = [
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)", // Blue
  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", // Orange
  "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)", // Green
  "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)", // Purple-Pink
  "linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)", // Pink
];

export default function CategorySlider({ categories }: Props) {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <SectionHeader
        title="Featured Categories"
        subtitle="Discover a variety of product categories tailored to your needs."
        titleClass="text-2xl sm:text-3xl lg:text-4xl"
        subtitleClass="text-sm sm:text-base lg:text-lg"
      />

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
          0: {
            slidesPerView: 1,
          },
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
            <Link href={`/category/${cat.slug}`} passHref>
              <div
                className="flex-shrink-0
                             w-[calc(100%-20px)] sm:w-[200px] lg:w-[260px]
                             h-[420px] bg-white rounded-lg group cursor-pointer relative overflow-hidden
                             transition-all duration-300 mx-auto"
              >
                <div
                  className={`
                    blur-sm
                      absolute
                      bottom-[80px] sm:bottom-[100px] md:bottom-[120px] lg:bottom-[80px] /* Tablet view shifted up */
                      left-1/2
                      -translate-x-1/2
                      z-0
                      w-[220px] sm:w-[150px] lg:w-[180px]
                      h-[80px] sm:h-[100px] lg:h-[120px]
                      rounded-sm
                      transition-all duration-500 ease-in-out
                      group-hover:w-[220px] sm:group-hover:w-[200px] lg:group-hover:w-[220px]
                      group-hover:h-[120px] sm:group-hover:h-[150px] lg:group-hover:h-[180px]
                      group-hover:rounded-[10px] group-hover:blur-none
                    `}
                  style={{
                    background: bgColors[index % bgColors.length],
                  }}
                />

                <div className="relative z-10 flex justify-center h-[300px] sm:h-[280px] items-start">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    width={280}
                    height={250}
                    className="object-contain transition-transform duration-500 group-hover:scale-115 group-hover:drop-shadow-lg"
                  />
                </div>

                <h3 className="relative z-10 mt-12 lg:mt-16 text-center text-base font-semibold text-black ">
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