import CategorySlider from "./CategorySlider.client";

interface Category {
  id: number;
  name: string;
  imageUrl: string;
}

type Props = {
  categories: Category[];
};

export default async function CategorySection({ categories }: Props) {
  return (
    <section className="w-full mt-4 md:mt-8">
      <CategorySlider categories={categories} />
    </section>
  );
}
