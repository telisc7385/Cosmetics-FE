'use client';

import { Category } from '@/types/category';
import PriceRangeSlider from '@/components/ClientsideComponent/PriceRangeSlider/PriceRangeSlider';

interface Props {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  priceRange: [number, number];
  onPriceChange: (values: [number, number]) => void;
}

export default function SidebarFiltersClient({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
}: Props) {
  return (

    <div className='lg:w-1/5 w-full' >
  
    <aside className=" sticky top-20 space-y-6">


      <div className="bg-white border border-gray-300 shadow p-5 rounded">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories</h2>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange('all')}
            className={`block w-full text-left text-sm font-medium rounded px-4 py-2 transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#b0c9e8] text-neutral-900'
                : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(String(cat.id))}
              className={`block w-full text-left text-sm font-medium rounded px-4 py-2 transition cursor-pointer ${
                selectedCategory === String(cat.id)
                  ? 'bg-[#b0c9e8] text-neutral-900'
                  : 'hover:bg-gray-100 text-gray-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <PriceRangeSlider
        min={10}
        max={3999}
        values={priceRange}
        onChange={onPriceChange}
      />
      </aside>
      </div>
  );
}




