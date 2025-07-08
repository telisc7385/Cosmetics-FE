import CategoryInfo from "@/components/ServersideComponent/CategoryInfo/CategoryInfo";
import { Category } from "@/types/category";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  try {
    const categoryRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/category/id?category=${id}`,
      { cache: "no-store" }
    );

    console.log(
      "Fetching category from:",
      `${process.env.NEXT_PUBLIC_BASE_URL}/category/id?category=${id}`
    );

    if (!categoryRes.ok) return notFound();

    const raw = await categoryRes.text();
    const data = JSON.parse(raw);
    console.log("✅ Parsed JSON:", data);

    if (
      !data.success ||
      !data.data ||
      !data.data.categories ||
      data.data.categories.length === 0
    ) {
      return notFound();
    }

    const categoryData = data.data.categories[0];
    const category: Category = {
      ...categoryData,
      products: data.data.products || [],
    };

    return <CategoryInfo category={category} products={category.products} />;
  } catch (error) {
    console.error("❌ Failed to load category:", error);
    return notFound();
  }
};

export default Page;
