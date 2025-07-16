import { fetchCategories } from "@/api/fetchCategories";
import ShopPageClient from "@/components/ClientsideComponent/shopPageClient/shopPageClient";

export default async function ShopPage() {
  const { categories } = await fetchCategories();

  return (
    <div className="mb-5 bg-white container mx-auto max-w-7xl">
      <ShopPageClient categories={categories} />
    </div>
  );
}
