import { Category } from "@/types/category";
import { apiCore } from "./ApiCore";
import { Product } from "@/types/product";

export interface GetCategoriesResponse {
  products: Product[];
  success: boolean;
  categories: Category[];
}

export const fetchCategories = async (): Promise<GetCategoriesResponse> => {
  try {
    const data = await apiCore("/category", "GET");
    return data as GetCategoriesResponse;
  } catch (error) {
    console.error("Error fetching categories:", (error as Error).message);
    throw error;
  }
};
