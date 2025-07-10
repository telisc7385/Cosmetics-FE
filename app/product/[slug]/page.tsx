import { fetchCategoryById } from "@/api/fetchCategoryById";
import { fetchProductBySlug } from "@/api/fetchProductBySlug";
import ProductDetailClient from "@/components/productDetailPage/ProductDetailPage";

import { notFound } from "next/navigation";

type Props = {
  // Change: params is a plain object, not a Promise
  params: { slug: string };
};

export default async function ProductPage({ params }: Props) {
  // Change: Remove 'await' when destructuring params
  const { slug } = params;

  console.log("Slug received by ProductPage:", slug); // Added console log for debugging

  const product = await fetchProductBySlug(slug);

  if (!product) {
    console.warn("Product not found in fetchProductBySlug for slug:", slug); // Added console log for debugging
    return notFound();
  }

  // Ensure categoryId is available from the product
  const categoryId = product.category?.id;
  const relatedProducts = categoryId ? await fetchCategoryById(categoryId) : [];

  // Exclude the current product
  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id);

  return (
    <div>
      <ProductDetailClient
        product={product}
        relatedProducts={filteredRelated}
      />
    </div>
  );
}
