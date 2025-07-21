import { ProductData } from "@/types/product";
import { apiCore } from "./ApiCore";

export async function getProducts(
  limit: number,
  page: number,
  newArrival?: boolean
): Promise<ProductData> {
  const params = new URLSearchParams();
  params.append("is_active", "true");
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (newArrival) {
    params.append("newArrival", "true");
  }
  const url = `/product?${params.toString()}`;
  // console.log("params", url)

  const data = await apiCore<ProductData>(url, "GET");

  return data;
}
