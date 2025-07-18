import { apiCore } from "./ApiCore";


export async function getAboutUsData() {
  const data = await apiCore<{ banners: any }>("/about_us_section", "GET");
  return data;
}