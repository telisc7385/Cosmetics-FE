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

  const filteredBanners = useMemo(() => {
    return banners.filter((banner) => banner.id !== 5);
  }, [banners]);

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
          if (mouseOver || filteredBanners.length === 0) return;
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

  if (filteredBanners.length === 0) return null;

  return (
    <div className="w-full relative">
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[650px] overflow-hidden">
        <div ref={sliderRef} className="keen-slider w-full h-full">
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
              <div className="absolute inset-0 z-10 flex items-center">
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 md:px-16">
                  <div className="max-w-[600px] text-black">
                    <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-normal leading-snug sm:leading-snug md:leading-tight drop-shadow-md">
                      {banner.heading}
                    </h2>
                    <p className="mt-4 text-sm sm:text-base md:text-lg text-black/90 drop-shadow">
                      {banner.subheading}{" "}
                      {banner.subheading2 && <span>{banner.subheading2}</span>}
                    </p>
                    <a
                      href={banner.buttonLink}
                      className="inline-block mt-6 px-6 py-2 bg-black text-white text-sm sm:text-base font-semibold shadow-md transition hover:bg-white hover:text-black border border-black"
                    >
                      {banner.buttonText}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators (absolute inside the banner container) */}
        {filteredBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {filteredBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => instanceRef.current?.moveToIdx(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? "bg-white" : "bg-white/50"
                }`}
              ></button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
