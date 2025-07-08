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
    <section className="w-full px-4 sm:px-6 md:px-10 mt-8">
      <div className="max-w-[90rem] mx-auto flex flex-col">
        <div className="w-full mt-10">
          <CategorySlider categories={categories} />
        </div>
      </div>
    </section>
  );
}
