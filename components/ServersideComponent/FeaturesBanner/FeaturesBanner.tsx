"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getWhyChooseUs } from "@/api/fetchWhyChooseUs";
import { WhyChooseUsItem } from "@/types/whyChooseUs";

const FeaturesBanner = () => {
  const [features, setFeatures] = useState<WhyChooseUsItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getWhyChooseUs();
      const filtered = data.filter((item) => Number(item.sequence_number) >= 4);
      setFeatures(filtered);
    };
    fetchData();
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#1d3b60] to-purple-400 text-white py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {features.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-3 w-full md:w-auto"
          >
            <div className="bg-white rounded-full p-2">
              <Image
                src={item.image || "/placeholder.png"} // fallback for null
                alt={item.heading || "Feature"}
                width={30}
                height={30}
              />
            </div>
            <div>
              <h4 className="font-semibold">{item.heading}</h4>
              <p className="text-sm">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesBanner;
