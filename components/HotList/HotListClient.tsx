"use client";

import { useKeenSlider, KeenSliderPlugin } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import ProductCard from "../CommonComponents/ProductCard/ProductCard";

// KeenSlider Animation Plugin
const animation: KeenSliderPlugin = (slider) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const clearNextTimeout = () => clearTimeout(timeout);

  slider.on("created", () => {
    slider.container.addEventListener("mouseover", clearNextTimeout);
    slider.container.addEventListener("mouseout", clearNextTimeout);
  });

  slider.on("animationStarted", clearNextTimeout);
};

interface HotListClientProps {
  products: Product[];
}

const HotListClient = ({ products }: HotListClientProps) => {
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>(
    {
      slides: {
        perView: 4,
        spacing: 16,
      },
      breakpoints: {
        "(max-width: 1024px)": {
          slides: { perView: 2.2, spacing: 14 },
        },
        "(max-width: 768px)": {
          slides: { perView: 1.2, spacing: 12 },
        },
      },
      renderMode: "performance",
      defaultAnimation: {
        duration: 200,
        easing: (t) => t,
      },
    },
    [animation]
  );

  const handlePrev = () => {
    if (!slider.current) return;
    const currentIdx = slider.current.track.details.rel;
    slider.current.moveToIdx(currentIdx - 1);
  };

  const handleNext = () => {
    if (!slider.current) return;
    const currentIdx = slider.current.track.details.rel;
    slider.current.moveToIdx(currentIdx + 1);
  };

  return (
    <section className="my-4 px-4 sm:px-10">
      {/* --- CHANGE MADE HERE: Replaced 'container' with 'max-w-[80rem]' --- */}
      <div className="max-w-[80rem] mx-auto">
        <h2 className="text-xl font-bold mb-2">Hot List</h2>
        <p className="text-sm text-gray-500 mb-4">
          Check out the most popular and trending products right now.
        </p>
        <div className="relative">
          {/* Arrows */}
          <button
            onClick={handlePrev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow p-2 rounded-full bg-white hover:bg-gray-100"
          >
            <CircleChevronLeft size={30} />
          </button>
          <button
            onClick={handleNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow p-2 rounded-full bg-white hover:bg-gray-100"
          >
            <CircleChevronRight size={30} />
          </button>

          {/* Slider */}
          <div ref={sliderRef} className="keen-slider">
            {products.map((product) => (
              <div key={product.id} className="keen-slider__slide">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotListClient;
