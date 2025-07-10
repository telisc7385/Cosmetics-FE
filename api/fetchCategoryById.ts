import { Product } from "@/types/product";

export const fetchCategoryById = async (categoryId: number): Promise<Product[]> => {
  try {
    const res = await fetch(
      `https://cosmaticadmin.twilightparadox.com/category/id?category=${categoryId}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch category");
    }

    const data = await res.json();
    console.log("FETCHED CATEGORY DATA:", data);

    // ✅ Corrected access path
    return data.data?.products || [];
  } catch (error) {
    console.error("Error fetching category products:", (error as Error).message);
    return [];
  }
};

