import { fetchCategories } from "@/api/fetchCategories";
import CategoryClientWrapper from "./CategoryClientWrapper";
import SectionHeader from "../CommonComponents/SectionHeader";

export default async function CategorySection() {
  const { categories } = await fetchCategories();

  return (
    <section className="w-full px-4 sm:px-10 mt-8">
      <SectionHeader 
  title="Featured Categories" 
  subtitle="Discover a variety of product categories tailored to your needs.." 
/>


      <CategoryClientWrapper categories={categories} />
    </section>
  );
}
