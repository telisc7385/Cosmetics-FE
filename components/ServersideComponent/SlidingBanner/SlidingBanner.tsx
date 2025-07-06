import React from "react";

const SlidingBanner = () => {
  const message =
    "This Friday Only — Flat 20% OFF on All Glow Essentials!";

  return (
    <div className="overflow-hidden w-full bg-white py-4">
      <div className="sliding-track flex whitespace-nowrap">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="flex gap-8">
            {[...Array(10)].map((_, i) => (
              <span
                key={`${index}-${i}`}
                className="inline-block text-[22px] sm:text-[28px] md:text-[32px] lg:text-[36px] xl:text-[42px] 2xl:text-[48px] font-bold outline-text"
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
