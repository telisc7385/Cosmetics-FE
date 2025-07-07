import CategoryClientWrapper from "./CategoryClientWrapper";
import SectionHeader from "../CommonComponents/SectionHeader";


interface Category {
  id: number;
  name: string;
  imageUrl: string;
}

type Props = {
  categories: Category[];
}

export default async function CategorySection({categories} : Props) {

  return (
    <section className="w-full px-4 sm:px-10 mt-8 container mx-auto">
      <SectionHeader 
  title="Featured Categories" 
  subtitle="Discover a variety of product categories tailored to your needs.." 
/>


      <CategoryClientWrapper categories={categories} />
    </section>
  );
}
