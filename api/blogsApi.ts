import { BlogsResponse } from "@/types/blogDataTypes";
import { apiCore } from "./ApiCore";

export async function getPaginatedBlogs(page = 1, pageSize = 12): Promise<BlogsResponse> {
  const data = await apiCore<BlogsResponse>(`/blog/?page=${page}&page_size=${pageSize}`, "GET");
  return data;
}
