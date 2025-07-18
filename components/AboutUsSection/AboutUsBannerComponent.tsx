import React from "react";
import Image from "next/image"; // Import Next.js Image component
import { SectionDataItems } from "@/types/AboutUsTypes";

type Props = {
  BannerData: SectionDataItems;
};

const AboutUsBannerComponent = ({ BannerData }: Props) => {
  console.log("Banner", BannerData);
  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[460px] lg:h-[500px] xl:h-[550px] flex items-center justify-center relative mt-4">
      <Image
        src={BannerData.image}
        alt={BannerData?.heading || "Banner Image"}
        layout="fill"
        objectFit="cover"
        className="absolute"
      />
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 md:px-16">
          <div className="max-w-[250px] md:max-w-[500px] text-black">
            <h2
              className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-normal leading-snug sm:leading-snug md:leading-tight drop-shadow-md transition-opacity duration-500`}
            >
              {BannerData.heading}
            </h2>
            <p
              className={`mt-4 text-sm sm:text-base md:text-lg drop-shadow transition-opacity duration-500`}
            >
              {BannerData.sub_heading}
            </p>
            {BannerData.description && (
              <p
                className={`mt-4 text-sm sm:text-base md:text-lg drop-shadow transition-opacity duration-500`}
              > {BannerData.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* <h2 className="text-white text-4xl lg:text-6xl md:text-2xl font-extrabold z-10">{BannerData?.heading}</h2> */}
    </div>
  );
};

export default AboutUsBannerComponent;
