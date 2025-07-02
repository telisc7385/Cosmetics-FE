// import { BannerType } from "@/types/banner";
// import BannerSlider from "@/components/ClientsideComponent/BannerSlider/BannerSlider";
// import { apiCore } from "@/api/ApiCore";
 
// const getBanners = async (): Promise<BannerType[]> => {
//   try {
//     const res = await apiCore("/banners", "GET");
//     return Array.isArray(res) ? res : res?.data || [];
//   } catch (err: unknown) {
//     // Changed 'any' to 'unknown'
//     // Safely check if 'err' is an instance of Error before accessing 'message'
//     if (err instanceof Error && err.message.includes("API error 404")) {
//       console.warn("Banner endpoint not found, fallback to empty array");
//       return [];
//     }
//     // If it's an Error, cast it to Error for logging message, otherwise log the whole object
//     console.error(
//       "Banner API error:",
//       err instanceof Error ? err.message : err
//     );
//     return [];
//   }
// };
 
// const HeroBanner = async () => {
//   const banners = await getBanners();
 
//   const active = banners
//     .filter((b) => b.isActive)
//     .sort((a, b) => a.sequence_number - b.sequence_number);
 
//   if (!active.length) return null;
 
//   return <BannerSlider banners={active} />;
// };
 
// export default HeroBanner;




import { BannerType } from "@/types/banner";
import BannerSlider from "@/components/ClientsideComponent/BannerSlider/BannerSlider";
import { apiCore } from "@/api/ApiCore";

// Function to fetch banners with proper typing
const getBanners = async (): Promise<BannerType[]> => {
  try {
    // Tell TypeScript what the shape of the response is
    const res = await apiCore<{ data: BannerType[] }>("/banners", "GET");

    // If the response is directly an array (fallback), return that; otherwise return res.data
    return Array.isArray(res) ? res : res.data || [];
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("API error 404")) {
      console.warn("Banner endpoint not found, fallback to empty array");
      return [];
    }

    console.error("Banner API error:", err instanceof Error ? err.message : err);
    return [];
  }
};

// Server Component to render the banner slider
const HeroBanner = async () => {
  const banners = await getBanners();

  const active = banners
    .filter((b) => b.isActive)
    .sort((a, b) => a.sequence_number - b.sequence_number);

  if (!active.length) return null;

  return <BannerSlider banners={active} />;
};

export default HeroBanner;
