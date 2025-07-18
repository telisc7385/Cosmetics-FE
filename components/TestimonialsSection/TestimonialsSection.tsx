import SectionHeader from "../CommonComponents/SectionHeader";
import TestimonialSlider, { Testimonial } from "./TestimonialSlider";

type Props = {
  testimonials: Testimonial[];
};

export default async function TestimonialSection({ testimonials }: Props) {
  return (
    <>
      {/* SectionHeader is now outside the bg-gray-50 section */}
      {/* This div will naturally have a transparent background, revealing the page's default background */}
      <div className="max-w-7xl mx-auto p-4 mt-5">
        <SectionHeader
          title="What Our Happy Clients Say"
          subtitle="Hear from our satisfied customers and why they love our brand."
          titleClass="text-2xl sm:text-3xl lg:text-4xl"
          subtitleClass="text-sm sm:text-base lg:text-lg"
        />
      </div>

      {/* Outer section: Handles full-width gray background and vertical padding for the slider itself. */}
      <section className="w-full py-0 bg-gray-50">
        {/* TestimonialSlider remains inside the gray section */}
        <TestimonialSlider
          testimonials={testimonials}
          // The title and subtitle props are still passed if TestimonialSlider needs them internally,
          // but visually the header is now separate.
          title="What our happy clients say"
          subtitle="Hear from our satisfied customers and why they love our brand."
        />
      </section>
    </>
  );
}
