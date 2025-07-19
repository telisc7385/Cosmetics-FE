// api/fetchCategories.ts
import { apiCore } from "./ApiCore";
import type { Category } from "@/types/category"; // ✅ Use type-only import

export interface GetCategoriesResponse {
  success: boolean;
  categories: Category[];
}

export const fetchCategories = async (): Promise<GetCategoriesResponse> => {
  try {
    const data = await apiCore<GetCategoriesResponse>("/category/frontend", "GET");
    return data;
  } catch (error) {
    console.error("Error fetching categories:", (error as Error).message);
    throw error;
  }
};

// ✅ Use `export type` for isolatedModules compatibility
export type { Category };



export async function fetchCategoryBySlug(slug: string) {
  const response = await apiCore<Category>(`/category/getCategory/${slug}`, "GET");
  return response;
}