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
    <section className="py-7 bg-gray-50 ">
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-2 px-10">
          What our happy clients say
        </h2>
        <p className="text-gray-600 mb-2 px-10">
          Hear from our satisfied customers and why they love our brand.
        </p>
        <hr className="mb-6 mt-3" />
      </div>
      <TestimonialSlider testimonials={testimonials} />
    </section>
  );
}
 
 