// import { Category } from "@/types/category";
// import { apiCore } from "./ApiCore";
// export async function fetchTopCategories(): Promise<Category[]> {
//   try {
//     const res = await apiCore<{ categories: Category[] }>("/category", "GET");
//     return res.categories ?? [];
//   } catch (error) {
//     console.error("[fetchTopCategories] Error:", error);
//     return [];
//   }
// }



import { Category } from "@/types/category";

export async function fetchTopCategories(): Promise<Category[]> {
  try {
    const response = await fetch("https://cosmaticadmin.twilightparadox.com/category", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { categories: Category[] } = await response.json();
    return data.categories ?? [];
  } catch (error) {
    console.error("[fetchTopCategories] Error:", error);
    return [];
  }
}
