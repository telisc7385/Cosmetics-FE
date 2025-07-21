import { Testimonial } from "@/components/TestimonialsSection/TestimonialSlider";
import { apiCore } from "./ApiCore";
import { WhyChooseUsItem } from "@/types/whyChooseUs";
import { GalleryImage } from "@/types/gallery";

export async function getWhyChooseUs(): Promise<WhyChooseUsItem[]> {
  try {
    const data = await apiCore<{ items?: WhyChooseUsItem[] }>(
      "/why-choose-us",
      "GET"
    );
    return data.items ?? [];
  } catch (error) {
    console.error("Error fetching Why Choose Us data:", error);
    return [];
  }
}


export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const data = await apiCore<{ testimonials?: Testimonial[] }>(
      "/frontend/testimonial?is_active=true",
      "GET"
    );
    return data.testimonials ?? [];
  } catch (error) {
    console.error("Error fetching Why Choose Us data:", error);
    return [];
  }
}


export async function getGallery(): Promise< GalleryImage[]> {
  try {
    const data = await apiCore<{ result?:  GalleryImage[] }>(
      "/gallery",
      "GET"
    );
    return data.result ?? [];
  } catch (error) {
    console.error("Error fetching Why Choose Us data:", error);
    return [];
  }
}