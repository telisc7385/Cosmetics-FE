// import { Product } from "@/types/product";
// import { apiCore } from "./ApiCore";



// export async function getSingleProduct(slug: string): Promise<Product | null> {
//   try {
//     const data = await apiCore(`/product/info/${slug}`, "GET");
//     return data;
//   } catch (error: unknown) {
//     console.error("Error fetching single product:", (error as Error).message);
//     return null;
//   }
// }


import { Product } from "@/types/product";
import { apiCore } from "./ApiCore";

export async function getSingleProduct(slug: string): Promise<Product | null> {
  try {
    const data = (await apiCore(`/product/info/${slug}`, "GET")) as Product;
    return data;
  } catch (error: unknown) {
    console.error("Error fetching single product:", (error as Error).message);
    return null;
  }
}
