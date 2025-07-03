import { getNewArrivalProducts } from "@/api/fetchNewArrivalProducts";
import ProductCard from "../CommonComponents/ProductCard/ProductCard";
import { Product } from "@/types/product";
import SectionHeader from "../CommonComponents/SectionHeader";

export default async function HotListWrapper() {
  const products = await getNewArrivalProducts();

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 text-lg">
        No new arrival products found.
      </div>
    );
  }

  return (

    <div className="py-5 px-[40px]">

<SectionHeader 
  title="Hot List" 
  subtitle="Out the most popular and trending products." 
/>

                <div className=" container mx-auto  grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
    </div>

  );
}
