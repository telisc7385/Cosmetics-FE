import { apiCore } from "./ApiCore";
import { Product } from "@/types/product";

export interface GetShopParams {
  page?: number;
  limit?: number;
  sort?: string;
  min?: number;
  max?: number;
  categories?: number[]; // Optional multi-category filter
}

export interface GetShopResponse {
  products: Product[];
  success: boolean;
  total_count: number;
  total_pages: number;
}

export const getShop = async (params: GetShopParams): Promise<GetShopResponse> => {
  const { page = 1, limit = 20, sort, min, max, categories = [] } = params;

  const query = new URLSearchParams();

  query.set("page", page.toString());
  query.set("limit", limit.toString());
  if (sort) query.set("sort", sort);
  if (min !== undefined) query.set("min", min.toString());
  if (max !== undefined) query.set("max", max.toString());

  // Support multiple category params: category=1&category=2
  categories.forEach((catId) => {
    query.append("category", String(catId));
  });

  const url = `/product?${query.toString()}`;

  try {
    const data = await apiCore<GetShopResponse>(url, "GET");
    return data;
  } catch (error) {
    console.error("Error fetching shop products:", error);
    throw error;
  }
};
