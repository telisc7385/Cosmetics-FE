// components/ServersideComponent/ProductServer/ProductServer.tsx

import { fetchProducts } from "@/api/fetchProduct";
// THIS IS THE CRITICAL LINE TO CHANGE:
import ProductCard from "@/components/CommonComponents/ProductCard/ProductCard";

const ProductServer = async () => {
  const { products } = await fetchProducts();

  return (
    <section className="px-4 py-10">
      <h2 className="text-2xl font-bold text-center mb-6">Featured Products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductServer;
