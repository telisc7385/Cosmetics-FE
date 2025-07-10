// File: D:\Suchit-Consmo-Official\Cosmatic-FE\app\product\[slug]\page.tsx
import { fetchCategoryById } from "@/api/fetchCategoryById";
import { fetchProductBySlug } from "@/api/fetchProductBySlug";
import ProductDetailClient from "@/components/productDetailPage/ProductDetailPage";

import { notFound } from "next/navigation";

type Props = {
  // UPDATED: params is now defined as a Promise, matching Next.js's internal PageProps
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  // UPDATED: Await params to get the actual object before destructuring
  const { slug } = await params;

  console.log("Slug received by ProductPage:", slug); // Retained for debugging

  const product = await fetchProductBySlug(slug);

  if (!product) {
    console.warn("Product not found in fetchProductBySlug for slug:", slug); // Retained for debugging
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
