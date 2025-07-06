import { apiCore } from "./ApiCore";
import { WhyChooseUsItem } from "@/types/whyChooseUs";

export async function getWhyChooseUs(): Promise<WhyChooseUsItem[]> {
  try {
    const data = await apiCore<{ items?: WhyChooseUsItem[] }>(
      "/why-choose-us",
      "GET"
    );
    return data.items ?? [];
  } catch (error) {
    console.error("Error fetching Why Choose Us data:", error);
    return [];
  }
}
