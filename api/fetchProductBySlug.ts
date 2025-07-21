import { Product } from "@/types/product";
import { apiCore } from "./ApiCore";

interface GetProductBySlugResponse {
  data: Product;
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const data = await apiCore<GetProductBySlugResponse>(`/product/info/${slug}`, "GET");
    return data.data || null;
  } catch (error) {
    console.error("Error fetching product by slug:", (error as Error).message);
    return null;
  }
}


export async function fetchAllTag() {
  const response:any = await apiCore(`/product-tag?is_ative=true`, "GET");
  return response?.results;
}