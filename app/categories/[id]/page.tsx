import CategoryInfo from "@/components/ServersideComponent/CategoryInfo/CategoryInfo";
import { Category } from "@/types/category";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/category/id?category=${id}`,
      { cache: "no-store" }
    );

    console.log("Fetching category metadata for ID:", res);

    if (!res.ok) return {};

    const data = await res.json();
    const category = data?.data?.categories?.[0];
    if (!category) return {};

    return {
      title: category.seo_title || category.name || "Category",
      description:
        category.seo_description || `Shop products in ${category.name}`,
    };
  } catch (error) {
    console.error("❌ Error generating metadata:", error);
    return {};
  }
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/category/id`);
    url.searchParams.append("category", id);

    url.searchParams.append("limit", "4");

    const categoryRes = await fetch(url.toString(), { cache: "no-store" });
    if (!categoryRes.ok) return notFound();

    const data = await categoryRes.json();
    if (!data.success || !data.data?.categories?.length) return notFound();

    const categoryData = data.data.categories[0];
    const products = data.data.products || [];

    const category: Category = {
      ...categoryData,
      products,
    };

    return (
      <div className="pt-4">
        <CategoryInfo
          category={category}
          initialProducts={products}
          initialPage={1}
          totalPagesFromServer={data.data.totalPages || 1}
        />
      </div>
    );
  } catch (error) {
    console.error("❌ Failed to load category:", error);
    return notFound();
  }
}
