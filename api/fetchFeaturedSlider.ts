import { ProductData } from "@/types/product"; // Assuming ProductData includes pagination info
import { apiCore } from "./ApiCore";

export async function getProducts(
  limit: number,
  page: number
): Promise<ProductData> {
  const data = await apiCore<ProductData>(
    `/product?is_active=true&page=${page}&limit=${limit}`,
    "GET"
  );
  return data;
}
