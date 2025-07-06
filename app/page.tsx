import CategorySection from "@/components/CategorySection/CategorySection";
import FeaturesBanner from "@/components/ServersideComponent/FeaturesBanner/FeaturesBanner";
import HeroBanner from "@/components/ServersideComponent/HeroBanner/HeroBanner";
import WhyChooseUs from "@/components/ServersideComponent/WhyChooseUs/WhyChooseUs";
import TestimonialsSection from "@/components/TestimonialsSection/TestimonialsSection";
import FeaturedSliderComponent from "@/components/ServersideComponent/FeaturedSliderComponent/FeaturedSliderComponent";
import GalleryPage from "@/components/ServersideComponent/GalleryPage/GalleryPage";
import HotListWrapper from "@/components/HotList/HotListWrapper";
import NewsletterSignup from "@/components/ClientsideComponent/NewsletterSignup/NewsletterSignup";
import SlidingBanner from "@/components/ServersideComponent/SlidingBanner/SlidingBanner";
import TopCategoriesClient from "@/components/ClientsideComponent/TopCategoriesClient/TopCategoriesClient";

import { getBanners } from "@/api/getBannerApi";
import { fetchCategories } from "@/api/fetchCategories";
import {
  getGallery,
  getTestimonials,
  getWhyChooseUs,
} from "@/api/fetchWhyChooseUs";
import { getProducts } from "@/api/fetchFeaturedSlider";

export default async function HomePage() {
  const [
    banners,
    categoriesResponse,
    whyChooseItems,
    product,
    testimonials,
    gallery,
  ] = await Promise.all([
    getBanners(),
    fetchCategories(),
    getWhyChooseUs(),
    getProducts(),
    getTestimonials(),
    getGallery(),
  ]);

  const { categories } = categoriesResponse;

  return (
    <div>
      <HeroBanner banners={banners} />
      <CategorySection categories={categories} />
      <FeaturesBanner />
      <TopCategoriesClient categories={categories} />
      <SlidingBanner />
      <HotListWrapper />
      <WhyChooseUs whyChooseItems={whyChooseItems} />
      <FeaturedSliderComponent product={product} />
      <TestimonialsSection testimonials={testimonials} />
      <GalleryPage gallery={gallery} />
      <NewsletterSignup />
    </div>
  );
}
