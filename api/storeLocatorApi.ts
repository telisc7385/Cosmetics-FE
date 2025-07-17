import { Store } from "@/types/storeDataTypes";
import { apiCore } from "./ApiCore";

export async function getStoreLocatorData() {
    const data = await apiCore<{ results: Store[] }>(
      "/store/",
      "GET",
    );
    return data.results;
  }