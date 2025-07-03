import Image from "next/image";
import ProductCard from "@/components/CommonComponents/ProductCard/ProductCard";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

interface Props {
  category: Category;
  products: Product[];
}

export default function CategoryInfo({ category, products }: Props) {
  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative w-full h-[350px] lg:h-[290px]">
        {category.banner ? (
          <Image
            src={category.banner}
            alt={category.name}
            fill
            className="object-contain w-full h-full"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Banner Available
          </div>
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Category Description */}
      <div className="w-full px-4 py-6 mt-3 mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-orange-100 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-orange-100 rounded-full opacity-30 translate-x-1/2 translate-y-1/2" />

          <h2 className="text-2xl font-semibold text-orange-600 mb-4">{category.name}</h2>
          <p className="text-gray-700 leading-relaxed">
            {category.description || "Browse high-quality products in this category."}
          </p>
        </div>
      </div>

      {/* Products Heading */}
      <h3 className="px-4 py-6 text-xl font-semibold">
        All Products / {category.name}
      </h3>

      {/* Product Grid */}
      <div className="px-4 pb-12">
        {products.length === 0 ? (
          <div className="bg-white border p-6 rounded shadow text-center text-gray-500">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
