"use client";
import React from "react";

const SlidingBanner = () => {
  const message = "This Friday Only — Flat 20% OFF on All Glow Essentials!";

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#fceae6] via-[#fdf7f5] to-[#fceae6] py-3 sm:py-3 md:py-2 lg:py-2.5">
      <div className="animate-slide-banner flex gap-12 sm:gap-14 md:gap-10 lg:gap-12 whitespace-nowrap">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="flex gap-12 sm:gap-14 md:gap-10 lg:gap-12"
          >
            {[...Array(6)].map((_, i) => (
              <span
                key={`${index}-${i}`}
                className="text-[#8b5e3c] text-[14px] sm:text-[16px] md:text-[15px] lg:text-[16px] xl:text-[20px] font-medium tracking-wide"
              >
                🌸 {message}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidingBanner;
