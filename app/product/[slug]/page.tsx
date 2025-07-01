import { fetchProductBySlug } from "@/api/fetchProductBySlug";
import ProductDetailClient from "@/components/productDetailPage/ProductDetailPage";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;


  console.log("Slug:", slug);

  const product = await fetchProductBySlug(slug);

  if (!product) return notFound();
  

  return (
    <div>
      <ProductDetailClient product={product} />
    </div>
  );
}



