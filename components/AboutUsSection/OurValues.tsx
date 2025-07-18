// components/AboutUs/OurStoryComponent.tsx
import { SectionDataItems } from '@/types/AboutUsTypes';
import React from 'react';
import SectionHeader from '../CommonComponents/SectionHeader';


type Props = {
    sectionData: SectionDataItems;
};
const OurValues = ({ sectionData }: Props) => {
    const { heading, image, components } = sectionData;

    // split heading into first word + rest, so you can style them differently
    // const [firstWord, ...restWords] = heading.split(' ');
    // const restOfHeading = restWords.join(' ');

    return (
        <section className="max-w-7xl mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Text Column */}
                <div className='flex flex-col gap-4'>
                    <h2 className={`text-[#213E5A] text-2xl sm:text-3xl lg:text-4xl`}>{heading}</h2>
                    {components.map(c => (
                        <p key={c.id} className="text-gray-600 leading-relaxed text-lg">
                            {c.description}
                        </p>
                    ))
                    }
                </div>
                {/* Image Column */}
                <div className="w-full">
                    <img
                        src={image}
                        alt={heading}
                        className="w-full h-[400px] lg:h-[600px] rounded-lg shadow-lg object-cover"
                    />
                </div>
            </div>
        </section>
    );
};

export default OurValues;
