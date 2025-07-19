import { apiCore, Coupon } from "@/api/ApiCore";
import { BannerType } from "@/types/banner";

// Explicitly define the response shape
interface BannersApiResponse {
  data: BannerType[];
}

export const getBanners = async (): Promise<BannerType[]> => {
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

    return [];
  }
};

export async function getCouponData(token: string) {
  const response = await apiCore<{ success: boolean; data: Coupon[] }>(
    `/coupon/discounts`,
    "GET",
    {},
    token
  );
  return response;
}
