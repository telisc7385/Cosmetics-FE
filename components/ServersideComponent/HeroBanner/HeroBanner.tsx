import { BannerType } from "@/types/banner";
import BannerSlider from "@/components/ClientsideComponent/BannerSlider/BannerSlider";

type props = {
  banners: BannerType[];
}

// Server Component to render the banner slider
const HeroBanner = async ({banners} : props) => {

  const active = banners
    .filter((b) => b.isActive)
    .sort((a, b) => a.sequence_number - b.sequence_number);

  if (!active.length) return null;

  return <BannerSlider banners={active} />;
};

export default HeroBanner;
