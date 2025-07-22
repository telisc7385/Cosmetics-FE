import { BlogsResponse, Blog } from "@/types/blogDataTypes";
import { apiCore } from "./ApiCore";

export async function getPaginatedBlogs(page = 1, pageSize = 12): Promise<BlogsResponse> {
  const data = await apiCore<BlogsResponse>(`/blog/?page=${page}&page_size=${pageSize}`, "GET");
  return data;
}

// ✨ NEW: Function to fetch a single blog by slug
export async function getSingleBlogBySlug(slug: string): Promise<any> {
  const data = await apiCore<any>(`/blog/content/${slug}`, "GET"); // Assuming your API is at /blog/content/<slug>/
  return data;
}