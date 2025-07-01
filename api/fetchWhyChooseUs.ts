


import { WhyChooseUsItem } from "@/types/whyChooseUs";
import { apiCore } from "./ApiCore";

export async function getWhyChooseUs(): Promise<WhyChooseUsItem[]> {
  try {
    // assert that data has an `items` array of the right type
    const data = (await apiCore("/why-choose-us", "GET")) as {
      items?: WhyChooseUsItem[];
    };
    return data.items ?? [];
  } catch (error) {
    console.error("Error fetching Why Choose Us data:", error);
    return [];
  }
}
