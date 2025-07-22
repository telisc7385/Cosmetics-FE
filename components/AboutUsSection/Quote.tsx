import type { SectionDataItems } from "@/types/AboutUsTypes" // Assuming this type is defined elsewhere
import Image from "next/image"

type Props = {
  sectionData: SectionDataItems
}

const Quote = ({ sectionData }: Props) => {
  return (
    <div className="relative min-h-[300px] py-12 flex items-center justify-center overflow-hidden bg-gray-50">
      {/* Floating Decorative Image at top-right */}
      <div className="absolute top-0 right-0 z-10  md:block">
        <Image
          src="https://res.cloudinary.com/dwydrvhua/image/upload/v1752756056/aboutus_component/pkleorzyramrphoa6wh3.png"
          alt="Decorative element top right"
          width={220}
          height={220}
          className="object-contain opacity-70"
        />
      </div>
      {/* Floating Decorative Image at bottom-left */}
      <div className="absolute bottom-0 left-0 z-10  md:block">
        <Image
          src="https://res.cloudinary.com/dwydrvhua/image/upload/v1752756066/aboutus_component/f37ehcqzlf0dvmmbbqde.png"
          alt="Decorative element bottom left"
          width={220}
          height={220}
          className="object-contain opacity-70"
        />
      </div>
      {/* Content: Heading, Description (Quote), and Author */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
        {sectionData.heading && (
          <h2 className={`text-[#213E5A] text-2xl sm:text-3xl lg:text-4xl text-center p-4`}>
            {sectionData.heading}
          </h2>
        )}
        {sectionData.description && (
          <p className="text-2xl md:text-3xl italic font-serif text-gray-700  max-w-2xl leading-relaxed">
            &ldquo;{sectionData.description}&rdquo;
          </p>
        )}
        {sectionData.sub_heading && (
          <p className="text-base md:text-lg font-semibold text-gray-500  mt-4">
            - {sectionData.sub_heading}
          </p>
        )}
      </div>
    </div>
  )
}

export default Quote
