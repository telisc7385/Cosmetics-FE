import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/CommonComponents/ProductCard/ProductCard";
import { Category } from "@/types/category";
import { Product } from "@/types/product";

interface Props {
  category: Category;
  products: Product[];
}

export default function CategoryInfo({ category, products }: Props) {
  return (
    <div className="w-full bg-white">
      {/* Full-width Banner */}
      <div className="relative w-full h-[220px] sm:h-[350px] lg:h-[290px]">
        {category.banner ? (
          <>
            <Image
              src={category.banner}
              alt={category.name}
              fill
              className="object-contain w-full h-full"
              priority
            />
            <div className="absolute inset-0 bg-black/30" />
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Banner Available
          </div>
        )}
      </div>

      {/* Container content centered horizontally on laptop+ */}
      <div className="w-full lg:max-w-7xl lg:mx-auto lg:flex lg:flex-col lg:items-center">
        {/* Category Description */}
        <section className="w-full px-4 py-6 mt-2 sm:mt-3 lg:flex lg:justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 relative overflow-hidden lg:w-[90%]">
            <div className="absolute top-0 left-0 w-24 h-24 bg-orange-100 rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-orange-100 rounded-full opacity-30 translate-x-1/2 translate-y-1/2" />

            <h2 className="text-[#213E5A] text-2xl font-semibold mb-4">
              {category.name}
            </h2>
            <p className="text-[#213E5A] text-lg leading-relaxed">
              {category.description ||
                "Discover premium, handpicked products tailored to your needs in this category."}
            </p>
          </div>
        </section>

        {/* Products Heading */}
        <div className="w-full px-4 lg:flex lg:justify-center">
          <h3 className="pt-4 pb-2 text-xl font-semibold text-gray-800 flex items-center gap-2 w-full lg:w-[90%]">
            <Link
              href="/shop"
              className="text-blue-600 hover:text-blue-800 underline underline-offset-4 transition-colors duration-200"
            >
              All Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">{category.name}</span>
          </h3>
        </div>

        {/* Product Grid */}
        <section className="px-4 pb-12 w-full lg:flex lg:justify-center">
          {products.length === 0 ? (
            <div className="bg-white border p-6 rounded shadow text-center text-gray-500 w-full lg:w-[90%]">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full lg:w-[90%]">
              {products.map((product) => (
                <div key={product.id} className="w-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
