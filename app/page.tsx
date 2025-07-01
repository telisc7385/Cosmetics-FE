import CategorySection from "@/components/CategorySection/CategorySection";
import FeaturesBanner from "@/components/ServersideComponent/FeaturesBanner/FeaturesBanner";
import Footer from "@/components/ServersideComponent/Footer/Footer";
import HeroBanner from "@/components/ServersideComponent/HeroBanner/HeroBanner";
import WhyChooseUs from "@/components/ServersideComponent/WhyChooseUs/WhyChooseUs";
import TestimonialsSection from "@/components/TestimonialsSection/TestimonialsSection";
import TopCategories from "@/components/ServersideComponent/TopCategories/TopCategories";
import ProductServer from "@/components/ServersideComponent/ProductServer/ProductServer";

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
      <ProductServer />
      <WhyChooseUs /> 
      <FeaturedSliderComponent />
      <TestimonialsSection />
      <GalleryPage />
      <FeaturesBanner />
      <Footer />
    </div>
  );
}
