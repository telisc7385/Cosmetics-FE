"use client";
import dynamic from "next/dynamic";

const CategorySlider = dynamic(() => import("./CategorySlider.client"), {
  ssr: false,
});

interface Category {
  id: number;
  name: string;
  imageUrl: string;
}

interface Props {
  categories: Category[];
}

export default function CategoryClientWrapper({ categories }: Props) {
  return <CategorySlider categories={categories} />;
}
