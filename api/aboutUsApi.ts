import { apiCore } from "./ApiCore";


export async function getAboutUsData() {
  const data = await apiCore<{ banners: any }>("/about_us_section?is_active=true", "GET");
  return data;
}