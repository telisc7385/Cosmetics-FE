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
    // --- CHANGE MADE HERE: Set loop to true to enable continuous looping ---
    loop: true, // Now the slider will loop endlessly
    mode: "free",
    slides: {
      perView: 2, // Show 2 cards on mobile
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
    <div className="py-5 px-4 md:px-10 max-w-[88rem] mx-auto">
      <SectionHeader
        title="Hot List"
        subtitle="Out the most popular and trending products."
      />

      <div ref={sliderRef} className="keen-slider">
        {products.map((product) => (
          <div key={product.id} className="keen-slider__slide py-5">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
