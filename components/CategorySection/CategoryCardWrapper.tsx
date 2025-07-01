"use client";
import dynamic from "next/dynamic";
import { Category } from "@/types/category";

const CategoryCards = dynamic(
  () => import("@/components/CategorySection/CategorySlider.client"),
  {
    ssr: false,
  }
);

type Props = {
  categories: Category[];
};

export default function CategoryCardsWrapper({ categories }: Props) {
  return <CategoryCards categories={categories} />;
}
