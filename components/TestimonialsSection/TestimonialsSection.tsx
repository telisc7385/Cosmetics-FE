import SectionHeader from "../CommonComponents/SectionHeader";
import TestimonialSlider, { Testimonial } from "./TestimonialSlider";

type Props = {
  testimonials: Testimonial[];
};

export default async function TestimonialSection({ testimonials }: Props) {
  return (
    <section className="w-full py-4 md:py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <SectionHeader
          title="What Our Happy Clients Say"
          subtitle="Hear from our satisfied customers and why they love our brand."
          titleClass="text-2xl sm:text-3xl lg:text-4xl"
          subtitleClass="text-sm sm:text-base lg:text-lg"
        />
        <TestimonialSlider
          testimonials={testimonials}
          // The title and subtitle props are still passed if TestimonialSlider needs them internally,
          // but visually the header is now separate.
          title="What our happy clients say"
          subtitle="Hear from our satisfied customers and why they love our brand."
        />
      </div>
    </section>
  );
}
