// app/page.tsx
import CategorySection from "@/components/CategorySection/CategorySection";
import FeaturesBanner from "@/components/ServersideComponent/FeaturesBanner/FeaturesBanner";
import HeroBanner from "@/components/ServersideComponent/HeroBanner/HeroBanner";
import TestimonialsSection from "@/components/TestimonialsSection/TestimonialsSection";
import FeaturedSliderComponent from "@/components/ServersideComponent/FeaturedSliderComponent/FeaturedSliderComponent";
import GalleryPage from "@/components/ServersideComponent/GalleryPage/GalleryPage";
import HotListWrapper from "@/components/HotList/HotListWrapper";
import NewsletterSignup from "@/components/ClientsideComponent/NewsletterSignup/NewsletterSignup";

import TopCategoriesClient from "@/components/ClientsideComponent/TopCategoriesClient/TopCategoriesClient";
// import PromotionBanner from "@/components/ClientsideComponent/PromotionBanner/PromotionBanner";

import { getBanners } from "@/api/getBannerApi";
import { fetchCategories } from "@/api/fetchCategories"; // This function's return type needs to be compatible
import {
  getGallery,
  getTestimonials,
} from "@/api/fetchWhyChooseUs";
import { getProducts } from "@/api/fetchFeaturedSlider";
import Counter from "@/components/ClientsideComponent/Counter/counter";
import { fetchAllTag } from "@/api/fetchProductBySlug";
import PromotionBanner from "@/components/ClientsideComponent/PromotionBanner/PromotionBanner";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [banners, categoriesResponse, product, testimonials, gallery, tagData, newArrival] =
    await Promise.all([
      getBanners(),
      fetchCategories(),
      // getWhyChooseUs(),
      getProducts(6, 1),
      getTestimonials(),
      getGallery(),
      fetchAllTag(),
      getProducts(10, 1, true),
    ]);
  const { categories } = categoriesResponse;

  return (
    <div className="bg-white">
      <HeroBanner banners={banners} />
      <CategorySection categories={categories} />
      <Counter />
      <TopCategoriesClient categories={categories} type={"category"} />
      <FeaturesBanner />
      <HotListWrapper newArrival={newArrival} />
      <FeaturedSliderComponent product={product?.products} />
      <TopCategoriesClient categories={tagData} type={"tag"} />
      {/* <TagProductFilter /> */}
      <TestimonialsSection testimonials={testimonials} />
      <GalleryPage gallery={gallery} />
      <NewsletterSignup />

      <PromotionBanner />
    </div>
  );
}
