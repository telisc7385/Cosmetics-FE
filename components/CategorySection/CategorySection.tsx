// import CategorySlider from "./CategorySlider.client";

// interface Category {
//   id: number;
//   name: string;
//   imageUrl: string;
// }

// type Props = {
//   categories: Category[];
// };

// export default async function CategorySection({ categories }: Props) {
//   return (
//     <section className="w-full mt-4 md:mt-8">
//       <CategorySlider categories={categories} />
//     </section>
//   );
// }


import CategorySlider from "./CategorySlider.client";
// 🎯 Import the canonical Category interface from api/ApiCore.ts
import { Category } from "@/api/ApiCore"; // Adjust path if necessary, e.g., '../api/ApiCore'

// Remove the local Category interface definition
// interface Category {
//   id: number;
//   name: string;
//   imageUrl: string; // Ensure the 'image' property in ApiCore's Category matches this if needed for the client component
// }

type Props = {
  categories: Category[];
};

export default async function CategorySection({ categories }: Props) {
  return (
    <section className="w-full mt-4 md:mt-8">
      {/* CategorySlider now expects the same 'Category' type that CategorySection is receiving */}
      <CategorySlider categories={categories} />
    </section>
  );
}