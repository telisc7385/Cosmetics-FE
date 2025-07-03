 
// import { createContext } from "react";
// // Import CartItem from its dedicated types file
// import { CartItem } from "@/types/cart"; // Ensure this path is correct
 
// interface LoggedInCartContextType {
//   items: CartItem[];
//   loading: boolean;
//   error: string | null;
//   addCartItem: (item: Omit<CartItem, "cartItemId">) => Promise<void>;
//   incrementItemQuantity: (cartItemId: number) => Promise<void>;
//   decrementItemQuantity: (cartItemId: number) => Promise<void>;
//   removeCartItem: (cartItemId: number) => Promise<void>;
//   clearCart: () => Promise<void>;
//   refetchCart: () => Promise<void>;
// }
 
// const LoggedInCartContext = createContext<LoggedInCartContextType | undefined>(
//   undefined
// );
 
// export default LoggedInCartContext;
 
import { fetchCategoryById } from "@/api/fetchCategoryById";
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
 
    // Ensure categoryId is available from the product
    const categoryId = product.category?.id;
    const relatedProducts = categoryId
      ? await fetchCategoryById(categoryId)
      : [];
 
    // Exclude the current product
    const filteredRelated = relatedProducts.filter((p) => p.id !== product.id);
 
 
  return (
    <div>
      <ProductDetailClient product={product}  relatedProducts={filteredRelated}  />
    </div>
  );
}
 
 
 
 
 