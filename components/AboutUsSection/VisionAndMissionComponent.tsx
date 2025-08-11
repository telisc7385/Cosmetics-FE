"use client";

import React from "react";
import Image from "next/image";
import SectionHeader from "../CommonComponents/SectionHeader";

type ComponentItem = {
  id: number;
  sequence_number: number;
  heading: string;
  sub_heading: string;
  description: string;
  image: string;
  precentage: string;
};

type Props = {
  sectionData?: {
    id: number;
    heading: string;
    sub_heading: string;
    description: string;
    image: string | null;
    components?: ComponentItem[];
  };
};

const VisionAndMissionComponent = ({ sectionData }: Props) => {
  return (
    <section className="relative w-full py-16 px-4 sm:px-6 md:px-10 bg-[#D1F5E0] overflow-hidden">

      <div className="relative z-20 max-w-6xl mx-auto">
        <SectionHeader
          title={sectionData?.heading || "Our Mission"}
          subtitle={sectionData?.sub_heading}
          titleClass="text-2xl sm:text-3xl lg:text-4xl"
          subtitleClass="text-sm sm:text-base lg:text-lg"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-10">
          {sectionData?.components?.map((item) => (
            <div
              key={item.id}
              className="bg-white/70 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-6 sm:p-8 transition-transform transform hover:scale-105 duration-300 hover:shadow-2xl"
            >
              <div className="flex items-start gap-4 sm:gap-6 flex-col sm:flex-row text-center sm:text-left">
                {item.image ? (
                  <div className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 mx-auto sm:mx-0">
                    <Image
                      src={item.image}
                      alt={item.heading}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 sm:h-14 sm:w-14 bg-pink-200 rounded-full flex-shrink-0 mx-auto sm:mx-0" />
                )}

                <div>
                  <h3 className="text-[#10626B] text-base sm:text-lg font-semibold mb-2">
                    {item.heading}
                  </h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VisionAndMissionComponent;
