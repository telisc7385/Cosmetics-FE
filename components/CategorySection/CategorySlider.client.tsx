"use client";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import SectionHeader from "../CommonComponents/SectionHeader";

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
    // The section already has responsive padding (px-4 sm:px-6 md:px-10)
    <section className="w-full px-4 sm:px-6 md:px-10">
      {/* This div needs a max-width and centering for the content inside CategorySlider itself */}
      <div className="max-w-8xl mx-auto">
        {/* 🔠 Section Header - Ensure its internal content is centered or aligns with container */}
        <SectionHeader
          title="Featured Categories"
          subtitle="Discover a variety of product categories tailored to your needs.."
          // Assuming SectionHeader is responsive and aligns its content properly
        />

        {/* 🚀 Swiper Slider */}
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
            // Mobile (0px and up) - 1 slide per view, card width adjusted
            0: {
              slidesPerView: 1, // Only 1 full card visible at a time on mobile
            },
            // Tablet (640px and up) - 3 slides per view, card width adjusted
            640: {
              slidesPerView: 3,
            },
            // Laptop (1024px and up) - 5 slides per view, original card width for laptop
            1024: {
              slidesPerView: 5,
            },
          }}
        >
          {categories.map((cat, index) => (
            <SwiperSlide key={cat.id}>
              <Link href={`/category/${cat.id}`} passHref>
                <div
                  className="flex-shrink-0 
                             w-[calc(100%-20px)] sm:w-[200px] lg:w-[260px] /* Responsive width for card */
                             h-[420px] bg-white rounded-lg group cursor-pointer relative overflow-hidden 
                             transition-all duration-300 mx-auto" // mx-auto for centering within slide
                >
                  {/* 🔵 Background Bubble */}
                  <div
                    className={`
                      absolute
                      bottom-[80px]
                      left-1/2
                      -translate-x-1/2
                      z-0
                      w-[120px] sm:w-[150px] lg:w-[180px] /* Responsive width for bubble */
                      h-[80px] sm:h-[100px] lg:h-[120px] /* Responsive height for bubble */
                      rounded-sm
                      transition-all duration-500 ease-in-out
                      group-hover:w-[180px] sm:group-hover:w-[200px] lg:group-hover:w-[220px] /* Hover responsive width */
                      group-hover:h-[120px] sm:group-hover:h-[150px] lg:group-hover:h-[180px] /* Hover responsive height */
                      group-hover:rounded-[10px]
                    `}
                    style={{
                      backgroundColor: bgColors[index % bgColors.length],
                    }}
                  />

                  {/* 🖼 Main Image */}
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
    </section>
  );
}
