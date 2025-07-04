



// import { Category } from "@/types/category";

// export async function fetchTopCategories(): Promise<Category[]> {
//   try {
//     const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data: { categories: Category[] } = await response.json();
//     return data.categories ?? [];
//   } catch (error) {
//     console.error("[fetchTopCategories] Error:", error);
//     return [];
//   }
// }




import { Category } from "@/types/category";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function fetchTopCategories(): Promise<Category[]> {
  try {
    if (!BASE_URL) {
      throw new Error("NEXT_PUBLIC_BASE_URL environment variable is not defined");
    }

    const response = await fetch(`${BASE_URL}/category/frontend`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: { categories: Category[] } = await response.json();
    return data.categories ?? [];
  } catch (error) {
    console.error("[fetchTopCategories] Error:", error);
    return [];
  }
}
