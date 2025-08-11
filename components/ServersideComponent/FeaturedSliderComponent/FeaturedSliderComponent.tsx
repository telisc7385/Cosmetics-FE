import React from "react";
import FeaturedSlider from "@/components/ClientsideComponent/FeaturedSlider/FeaturedSlider";
import SectionHeader from "@/components/CommonComponents/SectionHeader";
import { Product } from "@/types/product";
import Image from "next/image";

type Props = {
  product: Product[];
};

export default async function FeaturedSliderComponent({ product }: Props) {
  return (
    <>
      <SectionHeader
          title="Shop Our Best Sellers"
          subtitle="Trusted by Thousands, Loved for a Reason."
          titleClass="text-2xl sm:text-3xl lg:text-4xl"
          subtitleClass="text-sm sm:text-base lg:text-lg"
        />
    <section className="w-full py-4 md:py-8 relative">
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg1.png"
          alt="Featured Background"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#e9e6e1] opacity-40 z-10" />
      </div>
      <div className="max-w-7xl mx-auto p-4">
        <FeaturedSlider products={product} />
      </div>
    </section>
    </>
  );
}
