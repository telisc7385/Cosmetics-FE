import CategorySection from "@/components/CategorySection/CategorySection";
import FeaturesBanner from "@/components/ServersideComponent/FeaturesBanner/FeaturesBanner";
import HeroBanner from "@/components/ServersideComponent/HeroBanner/HeroBanner";
import WhyChooseUs from "@/components/ServersideComponent/WhyChooseUs/WhyChooseUs";
import TestimonialsSection from "@/components/TestimonialsSection/TestimonialsSection";
import TopCategories from "@/components/ServersideComponent/TopCategories/TopCategories";
import FeaturedSliderComponent from "@/components/ServersideComponent/FeaturedSliderComponent/FeaturedSliderComponent";
import GalleryPage from "@/components/ServersideComponent/GalleryPage/GalleryPage";
import HotListWrapper from "@/components/HotList/HotListWrapper";
import NewsletterSignup from "@/components/ClientsideComponent/NewsletterSignup/NewsletterSignup";
import SlidingBanner from "@/components/ServersideComponent/SlidingBanner/SlidingBanner";

export default async function HomePage() {
  return (
    <div>
      <HeroBanner />
      <CategorySection />
      <FeaturesBanner />
      <TopCategories />
      <SlidingBanner />
      <HotListWrapper></HotListWrapper>
      <WhyChooseUs />
      <FeaturedSliderComponent />
      <TestimonialsSection />
      <GalleryPage />

      <NewsletterSignup />
    </div>
  );
}
