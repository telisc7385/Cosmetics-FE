// app/store-locator/page.tsx  (or pages/store-locator.tsx)

"use client";

import dynamic from "next/dynamic";

const StoreLocator = dynamic(
  () => import("@/components/StoreLocator/StoreLocator"),
  { ssr: false }
);

export default function StoreLocatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner with heading */}
      <div
        className="h-[300px] md:h-[400px] bg-cover bg-center py-5 lg:py-10 flex justify-center items-center flex-col"
        style={{
          backgroundImage:
            "url(/testimonialbg.png)",
        }}
      >
        <h2
          className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-normal leading-snug sm:leading-snug md:leading-tight drop-shadow-md transition-opacity duration-500`}
        >          Find Your Glow Near You
        </h2>
      </div>

      <div className="max-w-7xl mx-auto py-8 md:px-4">
        <StoreLocator />
      </div>
    </div>
  );
}
