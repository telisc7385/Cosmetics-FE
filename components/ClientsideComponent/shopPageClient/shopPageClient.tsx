// 'use client';

// import React, { useState, useMemo, useEffect } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { Category } from '@/types/category';
// import { Product } from '@/types/product';

// import SortDropdown from '../SortDropdown.tsx/SortDropdown';
// import ProductCard from '@/components/CommonComponents/ProductCard/ProductCard';
// import { Funnel } from 'lucide-react';
// import SidebarFiltersClient from '@/components/ServersideComponent/SidebarFilters/SidebarFilters';

// interface Props {
//   categories: Category[];
//   products: Product[];
// }

// type SortOrder = 'price_asc' | 'price_desc';

// export default function ShopPageClient({ categories, products }: Props) {
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [priceRange, setPriceRange] = useState<[number, number]>([100, 3999]);
//   const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');
//   const [currentPage, setCurrentPage] = useState(1);

//   const itemsPerPage = 8;

//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const searchQuery = searchParams.get('search')?.toLowerCase() || '';

//   // Reset current page when filters/search change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery, selectedCategory, priceRange, sortOrder]);

//   // Filter products based on search, category, price
//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const matchesSearch =
//         !searchQuery || product.name.toLowerCase().includes(searchQuery);

//       const inCategory =
//         selectedCategory === 'all' ||
//         String(product.categoryId) === selectedCategory;

//       const price = Number(product.sellingPrice);
//       const inPriceRange = price >= priceRange[0] && price <= priceRange[1];

//       return matchesSearch && inCategory && inPriceRange;
//     });
//   }, [products, searchQuery, selectedCategory, priceRange]);

//   // Sort the filtered products
//   const sortedProducts = useMemo(() => {
//     return [...filteredProducts].sort((a, b) => {
//       const priceA = Number(a.sellingPrice);
//       const priceB = Number(b.sellingPrice);

//       if (sortOrder === 'price_asc') return priceA - priceB;
//       if (sortOrder === 'price_desc') return priceB - priceA;
//       return 0;
//     });
//   }, [filteredProducts, sortOrder]);

//   // Paginate the sorted products
//   const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return sortedProducts.slice(start, start + itemsPerPage);
//   }, [sortedProducts, currentPage]);

//   return (
//     <div>
//       {/* Banner */}
//       <div className="w-full h-[200px] relative">
//         <Image
//           src="/shopPage2.jpg"
//           alt="Shop Banner"
//           fill
//           className="object-cover rounded"
//         />
//       </div>

//       {/* Main content */}
//       <div className="mt-6 px-4 flex flex-col gap-4">
//         {/* Header row with filter + sort */}
//         <div className="flex justify-between items-center">
//           <div className="bg-[#966ad7] border lg:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
//             <h1 className="text-base flex gap-0.5 font-semibold text-gray-800">
//               <Funnel /> Filter
//             </h1>
//           </div>

//           <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
//         </div>

//         {/* Search Result Info */}
//         {searchQuery && (
//           <div className="flex items-center justify-between mt-2">
//             <p className="text-sm text-gray-600">
//               Showing results for: <strong>{searchQuery}</strong>
//             </p>
//             <button
//               onClick={() => router.push('/shop')}
//               className="text-sm text-blue-500 underline"
//             >
//               Clear Search
//             </button>
//           </div>
//         )}

//         {/* Layout: Sidebar + Product grid */}
//         <div className="flex gap-3">
//           {/* Sidebar */}
//           <SidebarFiltersClient
//             categories={categories}
//             selectedCategory={selectedCategory}
//             onCategoryChange={setSelectedCategory}
//             priceRange={priceRange}
//             onPriceChange={setPriceRange}
//           />

//           {/* Product Grid */}
//           <div className="flex-1">
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               {paginatedProducts.length > 0 ? (
//                 paginatedProducts.map((product) => (
//                   <ProductCard key={product.id} product={product} />
//                 ))
//               ) : (
//                 <p className="col-span-full text-center text-gray-500">
//                   No products found.
//                 </p>
//               )}
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex justify-center mt-6 gap-2 flex-wrap">
//                 <button
//                   onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                   disabled={currentPage === 1}
//                   className="px-3 py-1 border rounded disabled:opacity-50"
//                 >
//                   Prev
//                 </button>

//                 {[...Array(totalPages)].map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setCurrentPage(index + 1)}
//                     className={`px-3 py-1 border rounded ${
//                       currentPage === index + 1 ? 'bg-[#966ad7] text-white' : ''
//                     }`}
//                   >
//                     {index + 1}
//                   </button>
//                 ))}

//                 <button
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                   }
//                   disabled={currentPage === totalPages}
//                   className="px-3 py-1 border rounded disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





// 'use client';

// import React, { useState, useMemo, useEffect } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import Image from 'next/image';
// import { Category } from '@/types/category';
// import { Product } from '@/types/product';

// import SortDropdown from '../SortDropdown.tsx/SortDropdown';
// import ProductCard from '@/components/CommonComponents/ProductCard/ProductCard';
// import { Funnel } from 'lucide-react';
// import SidebarFiltersClient from '@/components/ServersideComponent/SidebarFilters/SidebarFilters';

// interface Props {
//   categories: Category[];
//   products: Product[];
// }

// type SortOrder = 'price_asc' | 'price_desc';

// export default function ShopPageClient({ categories, products }: Props) {
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [priceRange, setPriceRange] = useState<[number, number]>([100, 3999]);
//   const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');
//   const [currentPage, setCurrentPage] = useState(1);

//   const itemsPerPage = 8;

//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const searchQuery = searchParams.get('search')?.toLowerCase() || '';

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery, selectedCategory, priceRange, sortOrder]);

//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const matchesSearch =
//         !searchQuery || product.name.toLowerCase().includes(searchQuery);

//       const inCategory =
//         selectedCategory === 'all' ||
//         String(product.categoryId) === selectedCategory;

//       const price = Number(product.sellingPrice);
//       const inPriceRange = price >= priceRange[0] && price <= priceRange[1];

//       return matchesSearch && inCategory && inPriceRange;
//     });
//   }, [products, searchQuery, selectedCategory, priceRange]);

//   const sortedProducts = useMemo(() => {
//     return [...filteredProducts].sort((a, b) => {
//       const priceA = Number(a.sellingPrice);
//       const priceB = Number(b.sellingPrice);

//       if (sortOrder === 'price_asc') return priceA - priceB;
//       if (sortOrder === 'price_desc') return priceB - priceA;
//       return 0;
//     });
//   }, [filteredProducts, sortOrder]);

//   const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return sortedProducts.slice(start, start + itemsPerPage);
//   }, [sortedProducts, currentPage]);

//   return (
//     <div className="relative min-h-screen pb-24">
//       {/* Banner */}
//       <div className="w-full h-[300px] relative">
//         <Image
//           src="/shoppageBanner.webp"
//           alt="Shop Banner"
//           fill
//           className="object-cover rounded"
//         />
//       </div>

//       {/* Content */}
//       <div className="mt-6 px-4 flex flex-col gap-4">
//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <div className="bg-[#966ad7] border lg:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
//             <h1 className="text-base flex gap-0.5 font-semibold text-gray-800">
//               <Funnel /> Filter
//             </h1>
//           </div>
//           <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
//         </div>

//         {/* Search Info */}
//         {searchQuery && (
//           <div className="flex items-center justify-between mt-2">
//             <p className="text-sm text-gray-600">
//               Showing results for: <strong>{searchQuery}</strong>
//             </p>
//             <button
//               onClick={() => router.push('/shop')}
//               className="text-sm text-blue-500 underline"
//             >
//               Clear Search
//             </button>
//           </div>
//         )}

//         {/* Main Grid */}
//         <div className="flex gap-3">
//           {/* Sidebar */}
//           <SidebarFiltersClient
//             categories={categories}
//             selectedCategory={selectedCategory}
//             onCategoryChange={setSelectedCategory}
//             priceRange={priceRange}
//             onPriceChange={setPriceRange}
//           />

//           {/* Product Grid */}
//           <div className="flex-1 pb-16">
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               {paginatedProducts.length > 0 ? (
//                 paginatedProducts.map((product) => (
//                   <ProductCard key={product.id} product={product} />
//                 ))
//               ) : (
//                 <p className="col-span-full text-center text-gray-500">
//                   No products found.
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Fixed Pagination */}
//       {totalPages > 1 && (
//         <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow z-50 py-3 flex justify-center gap-2 flex-wrap">
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Prev
//           </button>

//           {[...Array(totalPages)].map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentPage(index + 1)}
//               className={`px-3 py-1 border rounded ${
//                 currentPage === index + 1 ? 'bg-[#966ad7] text-white' : ''
//               }`}
//             >
//               {index + 1}
//             </button>
//           ))}

//           <button
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//             }
//             disabled={currentPage === totalPages}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }




'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Category } from '@/types/category';
import { Product } from '@/types/product';

import SortDropdown from '../SortDropdown.tsx/SortDropdown';
import ProductCard from '@/components/CommonComponents/ProductCard/ProductCard';
import { Funnel } from 'lucide-react';
import SidebarFiltersClient from '@/components/ServersideComponent/SidebarFilters/SidebarFilters';

interface Props {
  categories: Category[];
  products: Product[];
}

type SortOrder = 'price_asc' | 'price_desc';

export default function ShopPageClient({ categories, products }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 3999]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, sortOrder]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchQuery || product.name.toLowerCase().includes(searchQuery);

      const inCategory =
        selectedCategory === 'all' ||
        String(product.categoryId) === selectedCategory;

      const price = Number(product.sellingPrice);
      const inPriceRange = price >= priceRange[0] && price <= priceRange[1];

      return matchesSearch && inCategory && inPriceRange;
    });
  }, [products, searchQuery, selectedCategory, priceRange]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = Number(a.sellingPrice);
      const priceB = Number(b.sellingPrice);

      if (sortOrder === 'price_asc') return priceA - priceB;
      if (sortOrder === 'price_desc') return priceB - priceA;
      return 0;
    });
  }, [filteredProducts, sortOrder]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="w-full h-[250px] relative">
        <Image
          src="/shopPage2.jpg"
          alt="Shop Banner"
          fill
          className="object-cover rounded"
        />
      </div>

      {/* Content */}
      <div className="mt-6 px-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="bg-[#966ad7] border lg:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
            <h1 className="text-base flex gap-0.5 font-semibold text-gray-800">
              <Funnel /> Filter
            </h1>
          </div>
          <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
        </div>

        {/* Search Info */}
        {searchQuery && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-600">
              Showing results for: <strong>{searchQuery}</strong>
            </p>
            <button
              onClick={() => router.push('/shop')}
              className="text-sm text-blue-500 underline"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Main Grid */}
        <div className="flex gap-3">
          {/* Sidebar */}
          <SidebarFiltersClient
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
          />

          {/* Product Grid */}
{/* Product Grid + Pagination */}
<div className="flex-1 flex flex-col min-h-[500px] justify-between">
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {paginatedProducts.length > 0 ? (
      paginatedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))
    ) : (
      <p className="col-span-full text-center text-gray-500">
        No products found.
      </p>
    )}
  </div>

  {/* Pagination */}
  {totalPages > 1 && (
    <div className="flex justify-center mt-6 gap-2 flex-wrap">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentPage(index + 1)}
          className={`px-3 py-1 border rounded ${
            currentPage === index + 1 ? 'bg-[#966ad7] text-white' : ''
          }`}
        >
          {index + 1}
        </button>
      ))}

      <button
        onClick={() =>
          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
        }
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )}
</div>

        </div>
      </div>
    </div>
  );
}
