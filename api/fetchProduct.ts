import { apiCore } from "@/api/ApiCore";
import { Product } from "@/types/product";

export interface GetProductsResponse {
  success: boolean;
  count: number;
  products: Product[];
}

export const fetchProducts = async (): Promise<GetProductsResponse> => {
  return await apiCore("/product", "GET");
};
