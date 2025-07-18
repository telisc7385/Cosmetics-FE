import { Store } from "@/types/storeDataTypes";
import { apiCore } from "./ApiCore";

export async function getStoreLocatorData(search?: string) {
  let url = "/store/?is_active=true";

  if (search?.trim()) {
    url += `&search=${encodeURIComponent(search.trim())}`;
  }

  const data = await apiCore<{ results: Store[] }>(url, "GET");
  return data.results;
}
