import { apiCore } from "@/api/ApiCore";
import { Product } from "@/types/product";

export interface GetProductsResponse {
  success: boolean;
  count: number;
  products: Product[];
}

interface ProductQueryParams {
  search?: string;
  sort?: "price_asc" | "price_desc";
  min?: number;
  max?: number;
  page?: number;
  limit?: number;
  category?: number[];
}

export const fetchProducts = async (
  queryParams: ProductQueryParams = {}
): Promise<GetProductsResponse> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const url = new URL("/product", baseUrl);

    // Append all valid query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "category" && Array.isArray(value)) {
          value.forEach((id) =>
            url.searchParams.append("category", id.toString())
          );
        } else {
          url.searchParams.append(key, value.toString());
        }
      }
    });

    const response = await apiCore<GetProductsResponse>(
      `${url.pathname}?${url.searchParams.toString()}`,
      "GET"
    );

    return response;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return {
      success: false,
      count: 0,
      products: [],
    };
  }
};
