// 'use client';

// import { Category } from '@/types/category';
// import PriceRangeSlider from '@/components/ClientsideComponent/PriceRangeSlider/PriceRangeSlider';

// interface Props {
//   categories: Category[];
//   selectedCategories: number[];
//   onCategoryChange: (id: number) => void;
//   priceRange: [number, number];
//   onPriceChange: (values: [number, number]) => void;
// }

// export default function SidebarFiltersClient({
//   categories,
//   selectedCategories,
//   onCategoryChange,
//   priceRange,
//   onPriceChange,
// }: Props) {
//   return (
//     <div className="lg:w-1/5 w-full">
//       <aside className="sticky top-20 space-y-8">

//         {/* 🗂 Category Filter */}
//         <div className="bg-white border border-gray-200 shadow-sm p-3 rounded-xl">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2"> Categories</h2>
//           <div className="space-y-3">
//             {categories.map((cat) => (
//               <label
//                 key={cat.id}
//                 className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition p-2 my-3 rounded-lg cursor-pointer"
//               >
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     checked={selectedCategories.includes(cat.id)}
//                     onChange={() => onCategoryChange(cat.id)}
//                     className="form-checkbox h-4 w-4 text-indigo-600 transition duration-200"
//                   />
//                   <span className="text-sm font-medium text-gray-700">{cat.name}</span>
//                 </div>
//               </label>
//             ))}
//           </div>
//         </div>

//         {/* 💰 Price Range Slider */}
//         <div className="bg-white border border-gray-200 shadow-sm p-2 rounded-xl">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-1">💰 Price Range</h2>
//           <PriceRangeSlider
//             min={10}
//             max={3999}
//             values={priceRange}
//             onChange={onPriceChange}
//           />
//         </div>

//       </aside>
//     </div>
//   );
// }





'use client';

import { Category } from '@/types/category';
import PriceRangeSlider from '@/components/ClientsideComponent/PriceRangeSlider/PriceRangeSlider';

interface Props {
  categories: Category[];
  selectedCategories: number[];
  onCategoryChange: (id: number) => void;
  priceRange: [number, number];
  onPriceChange: (values: [number, number]) => void;
}

export default function SidebarFiltersClient({
  categories,
  selectedCategories,
  onCategoryChange,
  priceRange,
  onPriceChange,
}: Props) {
  return (
    <div className="w-full lg:w-1/5">
      <aside className="sticky top-20 space-y-8">
        {/* 🗂 Category Filter */}
        <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-xl">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
            Categories
          </h2>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 transition p-3 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => onCategoryChange(cat.id)}
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
                <span className="text-sm sm:text-base text-gray-700">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 💰 Price Range Slider */}
        <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-xl">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
            💰 Price Range
          </h2>
          <PriceRangeSlider min={10} max={3999} values={priceRange} onChange={onPriceChange} />
        </div>
      </aside>
    </div>
  );
}
