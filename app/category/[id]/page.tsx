import CategoryInfo from "@/components/ServersideComponent/CategoryInfo/CategoryInfo";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  const categoryRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/category/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!categoryRes.ok) return notFound();

  // const categoryData = await categoryRes.json();
  // const category = categoryData?.category;

  // if (!categoryData.success || !category) return notFound();

  // const productRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/product`, {
  //   cache: "no-store",
  // });

  // if (!productRes.ok) return notFound();

  // const productData = await productRes.json();
  // const allProducts = productData?.products || [];

  // const filteredProducts = allProducts.filter((product: { categoryId: { id: number } }) => {
  //   const productCategoryId =
  //     typeof product.categoryId === "object" ? product.categoryId?.id : product.categoryId;
  //   return String(productCategoryId) === String(id);
  // });

  const data = await categoryRes.json();

  if (!data.success || !data.category) return notFound();

  const category: Category = data.category;
  const products: Product[] = category.products || [];

  return (
    <div>
      <CategoryInfo category={category} products={products} />
    </div>
  );
};

export default Page;
