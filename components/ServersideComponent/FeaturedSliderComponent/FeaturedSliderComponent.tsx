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
      <div className=" px-[40px] container mx-auto">
        <SectionHeader
          title="Shop Our Best Sellers"
          subtitle="Trusted by Thousands, Loved for a Reason."
        />
      </div>

      <FeaturedSlider products={product} />
    </>
  );
}
