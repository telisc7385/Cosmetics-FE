"use client";

import { getNewArrivalProducts } from "@/api/fetchNewArrivalProducts";
import ProductCard from "../CommonComponents/ProductCard/ProductCard";
import { Product } from "@/types/product";
import SectionHeader from "../CommonComponents/SectionHeader";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useEffect, useState } from "react";

export default function HotListWrapper() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewArrivalProducts()
      .then((res) => {
        setProducts(res || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    slides: {
      perView: 2,
      spacing: 15,
    },
    breakpoints: {
      "(min-width: 768px)": {
        slides: { perView: 3, spacing: 20 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 5, spacing: 20 },
      },
    },
  });

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (products.length === 0) {
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

      {products.length > 5 ? (
        <div ref={sliderRef} className="keen-slider">
          {products.map((product) => (
            <div key={product.id} className="keen-slider__slide">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
