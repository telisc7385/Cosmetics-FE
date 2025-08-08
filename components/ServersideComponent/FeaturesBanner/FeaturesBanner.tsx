"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getWhyChooseUs } from "@/api/fetchWhyChooseUs";
import { WhyChooseUsItem } from "@/types/whyChooseUs";
import SectionHeader from "@/components/CommonComponents/SectionHeader";

const FeaturesBanner = () => {
  const [features, setFeatures] = useState<WhyChooseUsItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getWhyChooseUs();
      const filtered = data.filter((item) => Number(item.sequence_number) >= 4);
      setFeatures(filtered.slice(0, 4));
    };
    fetchData();
  }, []);

  return (
    <section className="relative w-full py-4 md:py-8 overflow-hidden">
      {/* Background image and overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full"
          style={{
            background: "linear-gradient(to top right, #d1f5e0 0%, #d1f5e0 100%)",
          }}
        />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[6px] z-10" />
      </div>

      {/* Foreground content */}
      <div className="relative z-20 max-w-7xl mx-auto p-4">
        <SectionHeader
          title="Why Choose US"
          subtitle="Discover trust, quality, and lasting value."
          titleClass="text-2xl sm:text-3xl lg:text-4xl"
          subtitleClass="text-sm sm:text-base lg:text-lg"
        />
        <div className="mt-4 md:mt-8 flex flex-wrap justify-center gap-x-8 gap-y-12">
          {features.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center text-center w-full sm:w-[45%] md:w-[22%] lg:w-[22%] xl:w-[22%] px-2"
            >
              <div className="bg-[#10626b] rounded-full p-4 mb-4 flex items-center justify-center shadow-lg w-25 h-25 flex-shrink-0 group perspective">
                <div className="transition-transform duration-700 ease-in-out group-hover:rotate-y-360">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.heading || "Feature"}
                    width={80}
                    height={80}
                    className="filter invert brightness-0 saturate-200 contrast-200"
                  />
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 text-lg mb-2">
                {item.heading}
              </h4>
              <p className="text-md text-gray-600 max-w-xs leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBanner;
