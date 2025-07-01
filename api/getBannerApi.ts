import { apiCore } from "@/api/ApiCore";
import { BannerType } from "@/types/banner";

// Explicitly define the response shape
interface BannersApiResponse {
  data: BannerType[];
}

export const getBanners = async (): Promise<BannerType[]> => {
  try {
    const res = await apiCore<BannersApiResponse>("/frontend/banners", "GET");

    // Return res.data safely
    return res?.data ?? [];
  } catch (err: any) {
    if (err.message.includes("API error 404")) {
      console.warn("Banner endpoint not found, fallback to empty array");
      return [];
    }
    throw err;
  }
};

 