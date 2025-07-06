import React from "react";

const SlidingBanner = () => {
  // 👇 Space added at end of message manually
  const message =
    "This Friday Only — Flat 20% OFF on All Glow Essentials!     ";

  return (
    <div className="overflow-hidden w-full bg-white py-10">
      <div className="sliding-track flex whitespace-nowrap">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="flex gap-8">
            {[...Array(10)].map((_, i) => (
              <span
                key={`${index}-${i}`}
                className="inline-block text-[16px] sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] 2xl:text-[36px] font-bold outline-text"
              >
                {message}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidingBanner;
