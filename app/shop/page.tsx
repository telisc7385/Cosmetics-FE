import { fetchCategories } from "@/api/fetchCategories";
import ShopPageClient from "@/components/ClientsideComponent/shopPageClient/shopPageClient";
import Image from "next/image";

export default async function ShopPage() {
  const { categories } = await fetchCategories();

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="w-full h-[200px] lg:h-[300px] relative">
        <Image
          src="/shopbanner.png"
          alt="Shop Banner"
          fill
          className="object-cover w-full h-full"
          priority
        />
      </div>
      <div className="mb-5 bg-white container max-w-7xl mx-auto ">
        <ShopPageClient categories={categories} />
      </div>
    </div>
  );
}
