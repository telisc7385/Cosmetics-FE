import SectionHeader from "../CommonComponents/SectionHeader";
import TestimonialSlider from "./TestimonialSlider";
 
export default async function TestimonialSection() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/frontend/testimonial`,
    {
      next: { revalidate: 60 }, // cache for 1 hour
    }
  );
 
  const data = await res.json();
  const testimonials = data.testimonials;
 
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
 
 