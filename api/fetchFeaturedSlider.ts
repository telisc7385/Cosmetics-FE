import { Product } from "@/types/product";
import { apiCore } from "./ApiCore";

interface GetProductsResponse {
  success: boolean;
  count: number;
  products: Product[];
}

export async function getProducts(limit: number = 5): Promise<Product[]> {
  try {
    const data = await apiCore<GetProductsResponse>("/product?is_active=true", "GET");
    return data.products?.slice(0, limit) || [];
  } catch (error) {
    console.error("Error fetching products:", (error as Error).message);
    return [];
  }
}
