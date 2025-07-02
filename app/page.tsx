import CategorySection from "@/components/CategorySection/CategorySection";
import FeaturesBanner from "@/components/ServersideComponent/FeaturesBanner/FeaturesBanner";
import HeroBanner from "@/components/ServersideComponent/HeroBanner/HeroBanner";
import WhyChooseUs from "@/components/ServersideComponent/WhyChooseUs/WhyChooseUs";
import TestimonialsSection from "@/components/TestimonialsSection/TestimonialsSection";
import TopCategories from "@/components/ServersideComponent/TopCategories/TopCategories";
import FeaturedSliderComponent from "@/components/ServersideComponent/FeaturedSliderComponent/FeaturedSliderComponent";
import GalleryPage from "@/components/ServersideComponent/GalleryPage/GalleryPage";
import HotListWrapper from "@/components/HotList/HotListWrapper";


export default async function HomePage() {

  return (
    <div>
      <HeroBanner />
      <CategorySection />
      <TopCategories />
      <HotListWrapper></HotListWrapper>
      <WhyChooseUs /> 
      <FeaturedSliderComponent />
      <TestimonialsSection />
      <GalleryPage />
      <FeaturesBanner />

    </div>
  );
}
