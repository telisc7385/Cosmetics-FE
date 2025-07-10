import SectionHeader from "../CommonComponents/SectionHeader";
import TestimonialSlider, { Testimonial } from "./TestimonialSlider";

type Props = {
  testimonials: Testimonial[];
};

export default async function TestimonialSection({ testimonials }: Props) {
  return (
    // Outer section: Handles full-width gray background and vertical padding.
    <section className="w-full py-7 bg-gray-50">
      {/* This div is for the SectionHeader, constrained to max-w-[84rem] and centered. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 mb-10">
        {" "}
        {/* Added mb-10 for spacing */}
        <SectionHeader
          title="What our happy clients say"
          subtitle="Hear from our satisfied customers and why they love our brand."
        />
      </div>

      {/* --- CHANGE MADE HERE: TestimonialSlider is now outside the max-w-[84rem] container --- */}
      {/* Its own 'w-full bg-[#b0c9e8]' will make its blue background span the full screen width. */}
      <TestimonialSlider
        testimonials={testimonials}
        // The title and subtitle props are still passed, as TestimonialSlider now renders its own header
        title="What our happy clients say"
        subtitle="Hear from our satisfied customers and why they love our brand."
      />
    </section>
  );
}
