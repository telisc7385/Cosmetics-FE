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
  
    console.log("Fetching category from:", `${process.env.NEXT_PUBLIC_BASE_URL}/category/id?category=${id}`);
  
    if (!categoryRes.ok) return notFound();
  
    const data = await categoryRes.json();
  
    if (!data.success || !data.data) return notFound();
  
    const { products, ...rest } = data.data;
  
    const category: Category = {
      ...rest,
      products: products || [],
    };
  
    return <CategoryInfo category={category} products={products || []} />;
  } catch (error) {
    console.error("Failed to load category:", error);
    return notFound();
  }
  
  






};

export default Page;
