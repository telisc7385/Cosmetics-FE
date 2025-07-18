import { apiCore } from "./ApiCore";

export interface AbandonedItem {
  product: number;
  quantity: number;
  variant: number;
  discount_given_in_percent: number;
  discount_for_single_unit: number;
}

export async function getAbendentItems(token: string, userId: number) {
  const response = await apiCore<{ items: AbandonedItem[] }>(`/abandoned/items?userId=${userId}`, "GET", {}, token);
  return response;
}