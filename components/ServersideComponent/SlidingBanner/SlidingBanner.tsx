import React from "react";

const SlidingBanner = () => {
  return (
    <div className="overflow-hidden w-full bg-white py-4">
      <div className="flex whitespace-nowrap animate-scroll gap-8">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className="inline-block text-[60px] sm:text-[80px] md:text-[100px] font-bold outline-text"
          >
            Frontend
          </span>
        ))}
      </div>
    </div>
  );
};

export default SlidingBanner;
