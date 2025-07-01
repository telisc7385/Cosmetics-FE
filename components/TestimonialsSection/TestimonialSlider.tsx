// "use client";

// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay } from "swiper/modules";
// import "swiper/css";
// import Image from "next/image";
// import { useRef, useState } from "react";
// import type { Swiper as SwiperType } from "swiper";

// type Testimonial = {
//   id: string;
//   name: string;
//   role: string;
//   description: string;
//   image: string;
// };

// type Props = {
//   testimonials: Testimonial[];
// };

// export default function TestimonialSlider({ testimonials }: Props) {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const swiperRef = useRef<SwiperType | null>(null);

//   return (
//     <div className="w-full bg-[#b0c9e8] py-12 overflow-hidden px-0 mx-0">
//       <Swiper
//         modules={[Autoplay]}
//         spaceBetween={30}
//         slidesPerView={1}
//         centeredSlides
//         autoplay={{ delay: 4000, disableOnInteraction: false }}
//         onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
//         onSwiper={(swiperInstance) => (swiperRef.current = swiperInstance)}
//         breakpoints={{
//           640: { slidesPerView: 1 },
//           768: { slidesPerView: 2 },
//           1024: { slidesPerView: 3 },
//         }}
//         loop
//       >
//         {testimonials.map((t, index) => (
//           <SwiperSlide key={t.id}>
//             <div
//               className={`
//                 transition-transform duration-300 ease-in-out bg-white rounded-xl shadow-md p-6 mx-auto max-w-md my-10
//                 ${index === activeIndex ? "scale-110" : "scale-90"}

//                 sm:h-[250px] sm:overflow-hidden
//               `}
//             >
//               <div className="flex items-center gap-3 mb-3">
//                 <Image
//                   src={t.image}
//                   alt={t.name}
//                   width={48}
//                   height={48}
//                   className="rounded-full object-cover"
//                 />
//                 <div>
//                   <h4 className="font-bold text-lg text-black">{t.name}</h4>
//                   <p className="text-sm text-gray-500">{t.role}</p>
//                 </div>
//               </div>

//               <p
//                 className={`
//                   text-gray-700 text-sm
//                   sm:max-h-[100px] sm:overflow-y-auto sm:pr-1
//                   sm:[-ms-overflow-style:none] sm:[scrollbar-width:none]
//                   sm:[&::-webkit-scrollbar]:hidden
//                 `}
//               >
//                 {t.description}
//               </p>
//             </div>
//           </SwiperSlide>
//         ))}
//       </Swiper>
//     </div>
//   );
// }

"use client";
 
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Image from "next/image";
import { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
 
type Testimonial = {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
};
 
type Props = {
  testimonials: Testimonial[];
};
 
export default function TestimonialSlider({ testimonials }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
 
  return (
    <div className="w-full bg-[#b0c9e8] py-12 overflow-hidden px-0 mx-0">
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
                transition-transform duration-300 ease-in-out bg-white rounded-xl shadow-md p-6 mx-auto max-w-md my-10
                ${index === activeIndex ? "scale-110" : "scale-90"}
 
                sm:h-[250px] sm:overflow-hidden
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
 
              <p
                className={`
                  text-gray-700 text-sm
                  sm:max-h-[100px] sm:overflow-y-auto sm:pr-1
                  sm:[-ms-overflow-style:none] sm:[scrollbar-width:none]
                  sm:[&::-webkit-scrollbar]:hidden
                `}
              >
                {t.description}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
 
 
