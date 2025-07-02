import { Product } from "@/types/product";

export const fetchCategoryById = async (categoryId: number): Promise<Product[]> => {
  try {
    const res = await fetch(
      `https://cosmaticadmin.twilightparadox.com/category/${categoryId}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch category");
    }

    const data = await res.json();
    return data.category?.products || [];
  } catch (error) {
    console.error("Error fetching category products:", (error as Error).message);
    return [];
  }
};
