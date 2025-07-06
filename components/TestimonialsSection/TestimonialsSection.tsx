import SectionHeader from "../CommonComponents/SectionHeader";
import TestimonialSlider, { Testimonial } from "./TestimonialSlider";

type Props = {
  testimonials: Testimonial[];
};

export default async function TestimonialSection({ testimonials }: Props) {
  return (
    <section className="py-7 bg-gray-50 container mx-auto ">
      <div className="mb-10 px-[40px]">
        <SectionHeader
          title="What our happy clients say"
          subtitle="Hear from our satisfied customers and why they love our brand."
        />
      </div>
      <TestimonialSlider testimonials={testimonials} />
    </section>
  );
}
