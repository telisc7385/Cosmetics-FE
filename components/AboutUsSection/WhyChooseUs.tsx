// components/AboutUs/OurStoryComponent.tsx
import { SectionDataItems } from '@/types/AboutUsTypes';
import React from 'react';
import SectionHeader from '../CommonComponents/SectionHeader';
import Image from 'next/image';


type Props = {
    sectionData: SectionDataItems;
};
const WhyChooseUs = ({ sectionData }: Props) => {

    return (
        <div className="bg-[#f9fafb]">
            <h2 className={`text-[#213E5A] text-2xl sm:text-3xl lg:text-4xl text-center p-4`}>{sectionData.heading}</h2>
            <div className="container mx-auto flex flex-wrap justify-center gap-12 p-4">
                {sectionData.components.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-col items-center text-center w-full sm:w-[45%] md:w-[22%] lg:w-[22%] xl:w-[22%] px-2"
                    >
                        <div className="bg-[#213E5A] rounded-full p-4 mb-4 flex items-center justify-center shadow-lg w-25 h-25 flex-shrink-0 group perspective">
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
    );
};

export default WhyChooseUs;
