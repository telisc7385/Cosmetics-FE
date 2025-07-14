import React from "react";
import FeaturedSlider from "@/components/ClientsideComponent/FeaturedSlider/FeaturedSlider";
import SectionHeader from "@/components/CommonComponents/SectionHeader";
import { Product } from "@/types/product";

type Props = {
  product: Product[];
};

export default async function FeaturedSliderComponent({ product }: Props) {
  return (
    <>
      {/* --- CHANGE MADE HERE: Changed 'container' to 'max-w-[84rem]' --- */}
      <div className="px-[20px] mt-2 max-w-7xl mx-auto">
        <SectionHeader
          title="Shop Our Best Sellers"
          subtitle="Trusted by Thousands, Loved for a Reason."
        />
      </div>

      <FeaturedSlider products={product} />
    </>
  );
}
