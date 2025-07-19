import { fetchCategoryBySlug } from "@/api/fetchCategories"
import CategoryInfo from "@/components/ServersideComponent/CategoryInfo/CategoryInfo"
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;

  const category: any = await fetchCategoryBySlug(id);

  if (!category) {
    return {} // Return empty metadata if category/subcategory not found
  }

  return {
    title: category.seo_title || category.name || "Category",
    description: category.seo_description || `Shop products in ${category.name}`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/category/${category?.slug}`,
    },
    openGraph: {
      title: category.seo_title || category.name,
      description: category.seo_description || `Shop products in ${category.name}`,
      url: `/category/${category.slug}`,

      images: [
        {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}${category.image}`,
          width: 800,
          height: 600,
          alt: `${category.name} image`,
        },
      ],
      siteName: "Cosmatics Store",
    },
  }
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const category: any = await fetchCategoryBySlug(id);


  return (
    <div className="pt-4">
      <CategoryInfo
        category={category.data}
        // initialProducts={products} // This will be an empty array
        initialPage={1}
        totalPagesFromServer={1} // Assuming 1 page if no product data is fetched
      />
    </div>
  )
}
