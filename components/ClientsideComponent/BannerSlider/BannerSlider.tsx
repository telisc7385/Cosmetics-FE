"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

interface BannerItem {
  id: number;
  heading: string;
  subheading: string;
  subheading2?: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  mobile_banner?: string;
  isActive: boolean;
}

export default function BannerSlider({ banners }: { banners: BannerItem[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Corrected filtering logic for filteredBanners
  const filteredBanners = useMemo(() => {
    return banners.filter((banner) => {
      // Condition: Exclude the banner if its ID is exactly 5
      return banner.id !== 5;
    });
  }, [banners]);

  // Pass filteredBanners to KeenSlider
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      slides: { perView: 1 },
      slideChanged(s) {
        setCurrentSlide(s.track.details.rel);
      },
    },
    [
      (slider) => {
        let timeout: ReturnType<typeof setTimeout>;
        let mouseOver = false;

        function clearNextTimeout() {
          clearTimeout(timeout);
        }

        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver || filteredBanners.length === 0) return; // Add check for empty banners
          timeout = setTimeout(() => {
            slider.next();
          }, 4000);
        }

        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });

        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  // If there are no filtered banners, render nothing or a fallback message
  if (filteredBanners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[450px] xl:h-[500px] overflow-hidden">
      {/* Slider */}
      <div ref={sliderRef} className="keen-slider w-full h-full">
        {/* Use filteredBanners here */}
        {filteredBanners.map((banner) => (
          <div
            key={banner.id}
            className="keen-slider__slide relative w-full h-full"
          >
            {/* Background image */}
            <Image
              src={
                isMobile && banner.mobile_banner
                  ? banner.mobile_banner
                  : banner.imageUrl
              }
              alt={banner.heading}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />

            {/* Overlay content */}
            <div className="absolute inset-0 flex items-center px-4 sm:px-10 md:px-20 z-10">
              <div className="max-w-7xl mx-auto px-4 w-full">
                <div className="max-w-[60%] sm:max-w-[50%] text-black">
                  <h2 className="text-lg sm:text-xl md:text-3xl lg:text-5xl font-semibold leading-snug sm:leading-snug md:leading-tight">
                    {banner.heading}
                  </h2>
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-gray-700">
                    {banner.subheading}{" "}
                    {banner.subheading2 && <span>{banner.subheading2}</span>}
                  </p>
                  <a
                    href={banner.buttonLink}
                    className="inline-block mt-4 sm:mt-5 px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base bg-black text-white border border-white font-medium shadow transition hover:bg-white hover:text-black hover:border-black"
                  >
                    {banner.buttonText}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots - only show if there's more than one banner */}
      {filteredBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {filteredBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={`w-3 h-3 rounded-full transition ${
                currentSlide === idx ? "bg-white" : "bg-gray-400"
              }`}
            ></button>
          ))}
        </div>
      )}

      {/* Arrows (hidden on mobile) - only show if there's more than one banner */}
      {filteredBanners.length > 1 && (
        <>
          <button
            onClick={() => instanceRef.current?.prev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:scale-110 transition z-10 hidden sm:block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#007BFF"
              strokeWidth="2"
              className="rotate-180"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            onClick={() => instanceRef.current?.next()}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:scale-110 transition z-10 hidden sm:block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#007BFF"
              strokeWidth="2"
              className="rotate-180"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
