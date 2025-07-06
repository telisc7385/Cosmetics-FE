// 'use client';

// import React, { useEffect, useState, useMemo } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { Category } from '@/types/category';
// import { Product } from '@/types/product';
// import Image from 'next/image';
// import SidebarFiltersClient from '@/components/ServersideComponent/SidebarFilters/SidebarFilters';
// import ProductCard from '@/components/CommonComponents/ProductCard/ProductCard';
// import SortDropdown from '../SortDropdown.tsx/SortDropdown';
// import { Funnel } from 'lucide-react';

// interface Props {
//   categories: Category[];
// }

// type SortOrder = 'price_asc' | 'price_desc';

// export default function ShopPageClient({ categories }: Props) {
//   const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [priceRange, setPriceRange] = useState<[number, number]>([100, 3999]);
//   const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');
//   const [currentPage, setCurrentPage] = useState(1);

//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const searchQuery = searchParams.get('search')?.toLowerCase() || '';
//   const itemsPerPage = 8;

//   const handleCategoryChange = (id: number) => {
//     setSelectedCategories((prev) => {
//       const newSet = new Set(prev);
//       newSet.has(id) ? newSet.delete(id) : newSet.add(id);
//       return newSet;
//     });
//   };

//   // useEffect(() => {
//   //   const fetchProducts = async () => {
//   //     setLoading(true);
//   //     try {
//   //       const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/product`);
  
//   //       if (selectedCategories.size > 0) {
//   //         const categoryParam = Array.from(selectedCategories).join(',');
//   //         url += `?category=${categoryParam}`;
//   //       }
  
//   //       const res = await fetch(url);
//   //       const data = await res.json();
  
//   //       setProducts(data.products || []);
//   //     } catch (err) {
//   //       console.error('Error fetching products:', err);
//   //       setProducts([]);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };
  
//   //   fetchProducts();
//   // }, [selectedCategories]);





//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/product`);
  
//         if (selectedCategories.size > 0) {
//           const categoryParam = Array.from(selectedCategories).join(',');
//           url.searchParams.append('category', categoryParam); // ✅ CORRECT WAY
//         }
  
//         const res = await fetch(url.toString());
//         const data = await res.json();
  
//         setProducts(data.products || []);
//       } catch (err) {
//         console.error('Error fetching products:', err);
//         setProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchProducts();
//   }, [selectedCategories]);
  
  
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedCategories, priceRange, sortOrder, searchQuery]);

//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery);
//       const price = Number(product.sellingPrice);
//       const inPriceRange = price >= priceRange[0] && price <= priceRange[1];
//       return matchesSearch && inPriceRange;
//     });
//   }, [products, searchQuery, priceRange]);

//   const sortedProducts = useMemo(() => {
//     return [...filteredProducts].sort((a, b) => {
//       const priceA = Number(a.sellingPrice);
//       const priceB = Number(b.sellingPrice);
//       return sortOrder === 'price_asc' ? priceA - priceB : priceB - priceA;
//     });
//   }, [filteredProducts, sortOrder]);

//   const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return sortedProducts.slice(start, start + itemsPerPage);
//   }, [sortedProducts, currentPage]);

//   return (
//     <div className="min-h-screen">
//       <div className="w-full h-[250px] relative">
//         <Image src="/shopPage2.jpg" alt="Shop Banner" fill className="object-cover rounded" />
//       </div>

//       <div className="mt-6 px-4 flex flex-col gap-4">
//         {/* Header: Filter button (for mobile) and Sort dropdown */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
//           <div className="bg-[#966ad7] border sm:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
//             <h1 className="text-base flex gap-1 font-semibold text-white">
//               <Funnel /> Filter
//             </h1>
//           </div>
//           <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
//         </div>

//         {searchQuery && (
//           <div className="flex items-center justify-between mt-2 flex-wrap">
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

//         {/* Main content layout */}
//         <div className="flex flex-col lg:flex-row gap-4">
//           <SidebarFiltersClient
//             categories={categories}
//             selectedCategories={Array.from(selectedCategories)}
//             onCategoryChange={handleCategoryChange}
//             priceRange={priceRange}
//             onPriceChange={setPriceRange}
//           />

//           <div className="flex-1 flex flex-col min-h-[500px] justify-between">
//             {loading ? (
//               <div className="text-center mt-10 text-gray-500">Loading products...</div>
//             ) : (
//               <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                 {paginatedProducts.length > 0 ? (
//                   paginatedProducts.map((product) => (
//                     <ProductCard key={product.id} product={product} />
//                   ))
//                 ) : (
//                   <p className="col-span-full text-center text-gray-500">No products found.</p>
//                 )}
//               </div>
//             )}

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
//                   onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

// import React, { useEffect, useMemo, useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { Category } from '@/types/category';
// import { Product } from '@/types/product';
// import Image from 'next/image';
// import SidebarFiltersClient from '@/components/ServersideComponent/SidebarFilters/SidebarFilters';
// import ProductCard from '@/components/CommonComponents/ProductCard/ProductCard';
// import SortDropdown from '../SortDropdown.tsx/SortDropdown';
// import { Funnel } from 'lucide-react';

// interface Props {
//   categories: Category[];
// }

// type SortOrder = 'price_asc' | 'price_desc';

// export default function ShopPageClient({ categories }: Props) {
//   const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [priceRange, setPriceRange] = useState<[number, number]>([100, 3999]);
//   const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');
//   const [currentPage, setCurrentPage] = useState(1);

//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const searchQuery = searchParams.get('search')?.toLowerCase() || '';
//   const itemsPerPage = 8;

//   const handleCategoryChange = (id: number) => {
//     setSelectedCategories((prev) => {
//       const newSet = new Set(prev);
//       newSet.has(id) ? newSet.delete(id) : newSet.add(id);
//       return newSet;
//     });
//   };

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/product`);

//         if (selectedCategories.size > 0) {
//           const categoryParam = Array.from(selectedCategories).join(',');
//           url.searchParams.append('category', categoryParam);
//         }

//         const res = await fetch(url.toString());
//         const data = await res.json();

//         setProducts(data.products || []);
//       } catch (err) {
//         console.error('Error fetching products:', err);
//         setProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [selectedCategories]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedCategories, priceRange, sortOrder, searchQuery]);

//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery);
//       const price = Number(product.sellingPrice);
//       const inPriceRange = price >= priceRange[0] && price <= priceRange[1];
//       return matchesSearch && inPriceRange;
//     });
//   }, [products, searchQuery, priceRange]);

//   const sortedProducts = useMemo(() => {
//     return [...filteredProducts].sort((a, b) => {
//       const priceA = Number(a.sellingPrice);
//       const priceB = Number(b.sellingPrice);
//       return sortOrder === 'price_asc' ? priceA - priceB : priceB - priceA;
//     });
//   }, [filteredProducts, sortOrder]);

//   const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return sortedProducts.slice(start, start + itemsPerPage);
//   }, [sortedProducts, currentPage]);

//   return (
//     <div className="min-h-screen">
//       {/* Banner */}
//       <div className="w-full h-[250px] relative">
//         <Image src="/shopPage2.jpg" alt="Shop Banner" fill className="object-cover rounded" />
//       </div>

//       <div className="mt-6 px-4 flex flex-col gap-4">
//         {/* Header: Filter & Sort */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
//           <div className="bg-[#966ad7] border sm:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
//             <h1 className="text-base flex gap-1 font-semibold text-white">
//               <Funnel /> Filter
//             </h1>
//           </div>
//           <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
//         </div>

//         {/* Search Query Info */}
//         {searchQuery && (
//           <div className="flex items-center justify-between mt-2 flex-wrap">
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

//         {/* Layout */}
//         <div className="flex flex-col lg:flex-row gap-4">
//           {/* Sidebar Filters */}
//           <SidebarFiltersClient
//             categories={categories}
//             selectedCategories={Array.from(selectedCategories)}
//             onCategoryChange={handleCategoryChange}
//             priceRange={priceRange}
//             onPriceChange={setPriceRange}
//           />

//           {/* Product Grid + Pagination */}
//           <div className="flex-1 flex flex-col min-h-[500px] justify-between">
//             {loading ? (
//               <div className="text-center mt-10 text-gray-500">Loading products...</div>
//             ) : (
//               <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                 {paginatedProducts.length > 0 ? (
//                   paginatedProducts.map((product) => (
//                     <ProductCard key={product.id} product={product} />
//                   ))
//                 ) : (
//                   <p className="col-span-full text-center text-gray-500">No products found.</p>
//                 )}
//               </div>
//             )}

//             {/* Pagination Controls */}
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
//                   onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

// import React, { useEffect, useMemo, useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { Category } from '@/types/category';
// import { Product } from '@/types/product';
// import Image from 'next/image';
// import SidebarFiltersClient from '@/components/ServersideComponent/SidebarFilters/SidebarFilters';
// import ProductCard from '@/components/CommonComponents/ProductCard/ProductCard';
// import SortDropdown from '../SortDropdown.tsx/SortDropdown';
// import { Funnel } from 'lucide-react';

// interface Props {
//   categories: Category[];
// }

// type SortOrder = 'price_asc' | 'price_desc';

// export default function ShopPageClient({ categories }: Props) {
//   const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [priceRange, setPriceRange] = useState<[number, number]>([100, 3999]);
//   const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');
//   const [currentPage, setCurrentPage] = useState(1);

//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const searchQuery = searchParams.get('search')?.toLowerCase() || '';
//   const itemsPerPage = 8;

//   // Handle selecting/unselecting categories
//   const handleCategoryChange = (id: number) => {
//     setSelectedCategories((prev) => {
//       const newSet = new Set(prev);
//       newSet.has(id) ? newSet.delete(id) : newSet.add(id);
//       return newSet;
//     });
//   };

//   // Sync selected categories to URL (optional)
//   useEffect(() => {
//     const queryParams = new URLSearchParams();

//     if (selectedCategories.size > 0) {
//       queryParams.set('category', Array.from(selectedCategories).join(','));
//     }

//     if (searchQuery) {
//       queryParams.set('search', searchQuery);
//     }

//     router.push(`/shop?${queryParams.toString()}`);
//   }, [selectedCategories]);

//   // Fetch products on category change
//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/product`);

//         if (selectedCategories.size > 0) {
//           const categoryParam = Array.from(selectedCategories).join(',');
//           url.searchParams.append('category', categoryParam);
//         }

//         const res = await fetch(url.toString());
//         const data = await res.json();

//         setProducts(data.products || []);
//       } catch (err) {
//         console.error('Error fetching products:', err);
//         setProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [selectedCategories]);

//   // Reset to page 1 when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedCategories, priceRange, sortOrder, searchQuery]);

//   // Search and Price Range Filtering
//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery);
//       const price = Number(product.sellingPrice);
//       const inPriceRange = price >= priceRange[0] && price <= priceRange[1];
//       return matchesSearch && inPriceRange;
//     });
//   }, [products, searchQuery, priceRange]);

//   // Sorting
//   const sortedProducts = useMemo(() => {
//     return [...filteredProducts].sort((a, b) => {
//       const priceA = Number(a.sellingPrice);
//       const priceB = Number(b.sellingPrice);
//       return sortOrder === 'price_asc' ? priceA - priceB : priceB - priceA;
//     });
//   }, [filteredProducts, sortOrder]);

//   // Pagination
//   const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return sortedProducts.slice(start, start + itemsPerPage);
//   }, [sortedProducts, currentPage]);

//   return (
//     <div className="min-h-screen">
//       {/* Banner */}
//       <div className="w-full h-[250px] relative">
//         <Image src="/shopPage2.jpg" alt="Shop Banner" fill className="object-cover rounded" />
//       </div>

//       <div className="mt-6 px-4 flex flex-col gap-4">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
//           <div className="bg-[#966ad7] border sm:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
//             <h1 className="text-base flex gap-1 font-semibold text-white">
//               <Funnel /> Filter
//             </h1>
//           </div>
//           <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
//         </div>

//         {/* Search Info */}
//         {searchQuery && (
//           <div className="flex items-center justify-between mt-2 flex-wrap">
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

//         {/* Main Layout */}
//         <div className="flex flex-col lg:flex-row gap-4">
//           {/* Sidebar Filters */}
//           <SidebarFiltersClient
//             categories={categories}
//             selectedCategories={Array.from(selectedCategories)}
//             onCategoryChange={handleCategoryChange}
//             priceRange={priceRange}
//             onPriceChange={setPriceRange}
//           />

//           {/* Product Grid + Pagination */}
//           <div className="flex-1 flex flex-col min-h-[500px] justify-between">
//             {loading ? (
//               <div className="text-center mt-10 text-gray-500">Loading products...</div>
//             ) : (
//               <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                 {paginatedProducts.length > 0 ? (
//                   paginatedProducts.map((product) => (
//                     <ProductCard key={product.id} product={product} />
//                   ))
//                 ) : (
//                   <p className="col-span-full text-center text-gray-500">No products found.</p>
//                 )}
//               </div>
//             )}

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
//                   onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

// import React, { useEffect, useMemo, useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { Category } from '@/types/category';
// import { Product } from '@/types/product';
// import Image from 'next/image';
// import SidebarFiltersClient from '@/components/ServersideComponent/SidebarFilters/SidebarFilters';
// import ProductCard from '@/components/CommonComponents/ProductCard/ProductCard';
// import SortDropdown from '../SortDropdown.tsx/SortDropdown';
// import { Funnel } from 'lucide-react';

// interface Props {
//   categories: Category[];
// }

// type SortOrder = 'price_asc' | 'price_desc';

// export default function ShopPageClient({ categories }: Props) {
//   const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [priceRange, setPriceRange] = useState<[number, number]>([100, 3999]);
//   const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');
//   const [currentPage, setCurrentPage] = useState(1);

//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const searchQuery = searchParams.get('search')?.toLowerCase() || '';
//   const itemsPerPage = 8;

//   const handleCategoryChange = (id: number) => {
//     setSelectedCategories((prev) => {
//       const newSet = new Set(prev);
//       newSet.has(id) ? newSet.delete(id) : newSet.add(id);
//       return newSet;
//     });
//   };

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/product`);

//         if (selectedCategories.size > 0) {
//           const categoryParam = Array.from(selectedCategories).join(',');
//           url.searchParams.append('category', categoryParam);
//         }

//         const res = await fetch(url.toString());
//         const data = await res.json();

//         setProducts(data.products || []);
//       } catch (err) {
//         console.error('Error fetching products:', err);
//         setProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [selectedCategories]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedCategories, priceRange, sortOrder, searchQuery]);

//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery);
//       const price = Number(product.sellingPrice);
//       const inPriceRange = price >= priceRange[0] && price <= priceRange[1];
//       return matchesSearch && inPriceRange;
//     });
//   }, [products, searchQuery, priceRange]);

//   const sortedProducts = useMemo(() => {
//     return [...filteredProducts].sort((a, b) => {
//       const priceA = Number(a.sellingPrice);
//       const priceB = Number(b.sellingPrice);
//       return sortOrder === 'price_asc' ? priceA - priceB : priceB - priceA;
//     });
//   }, [filteredProducts, sortOrder]);

//   const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return sortedProducts.slice(start, start + itemsPerPage);
//   }, [sortedProducts, currentPage]);

//   return (
//     <div className="min-h-screen">
//       {/* Banner */}
//       <div className="w-full h-[250px] relative">
//         <Image src="/shopPage2.jpg" alt="Shop Banner" fill className="object-cover rounded" />
//       </div>

//       <div className="mt-6 px-4 flex flex-col gap-4">
//         {/* Header: Filter & Sort */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
//           <div className="bg-[#966ad7] border sm:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
//             <h1 className="text-base flex gap-1 font-semibold text-white">
//               <Funnel /> Filter
//             </h1>
//           </div>
//           <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
//         </div>

//         {/* Search Query Info */}
//         {searchQuery && (
//           <div className="flex items-center justify-between mt-2 flex-wrap">
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

//         {/* Layout */}
//         <div className="flex flex-col lg:flex-row gap-4">
//           {/* Sidebar Filters */}
//           <SidebarFiltersClient
//             categories={categories}
//             selectedCategories={Array.from(selectedCategories)}
//             onCategoryChange={handleCategoryChange}
//             priceRange={priceRange}
//             onPriceChange={setPriceRange}
//           />

//           {/* Product Grid + Pagination */}
//           <div className="flex-1 flex flex-col min-h-[500px] justify-between">
//             {loading ? (
//               <div className="text-center mt-10 text-gray-500">Loading products...</div>
//             ) : (
//               <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                 {paginatedProducts.length > 0 ? (
//                   paginatedProducts.map((product) => (
//                     <ProductCard key={product.id} product={product} />
//                   ))
//                 ) : (
//                   <p className="col-span-full text-center text-gray-500">No products found.</p>
//                 )}
//               </div>
//             )}

//             {/* Pagination Controls */}
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
//                   onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

// import React, { useEffect, useMemo, useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import { Category } from '@/types/category';
// import { Product } from '@/types/product';
// import Image from 'next/image';
// import SidebarFiltersClient from '@/components/ServersideComponent/SidebarFilters/SidebarFilters';
// import ProductCard from '@/components/CommonComponents/ProductCard/ProductCard';
// import SortDropdown from '../SortDropdown.tsx/SortDropdown';
// import { Funnel } from 'lucide-react';

// interface Props {
//   categories: Category[];
// }

// type SortOrder = 'price_asc' | 'price_desc';

// export default function ShopPageClient({ categories }: Props) {
//   const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [priceRange, setPriceRange] = useState<[number, number]>([100, 3999]);
//   const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');
//   const [currentPage, setCurrentPage] = useState(1);

//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const searchQuery = searchParams.get('search')?.toLowerCase() || '';
//   const itemsPerPage = 8;

//   const handleCategoryChange = (id: number) => {
//     setSelectedCategories((prev) => {
//       const newSet = new Set(prev);
//       newSet.has(id) ? newSet.delete(id) : newSet.add(id);
//       return newSet;
//     });
//   };

//   // Reset to page 1 when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedCategories, priceRange, sortOrder, searchQuery]);

//   // Fetch products from API when categories or page changes
//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/category/id`);

//         // Append multiple `category` query params
//         Array.from(selectedCategories).forEach((id) => {
//           url.searchParams.append('category', id.toString());
//         });

//         // Always append page param
//         url.searchParams.append('page', currentPage.toString());

//         const res = await fetch(url.toString());
//         const data = await res.json();

//         setProducts(data.products || []);
//       } catch (err) {
//         console.error('Error fetching products:', err);
//         setProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [selectedCategories, currentPage]);

//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery);
//       const price = Number(product.sellingPrice);
//       const inPriceRange = price >= priceRange[0] && price <= priceRange[1];
//       return matchesSearch && inPriceRange;
//     });
//   }, [products, searchQuery, priceRange]);

//   const sortedProducts = useMemo(() => {
//     return [...filteredProducts].sort((a, b) => {
//       const priceA = Number(a.sellingPrice);
//       const priceB = Number(b.sellingPrice);
//       return sortOrder === 'price_asc' ? priceA - priceB : priceB - priceA;
//     });
//   }, [filteredProducts, sortOrder]);

//   const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return sortedProducts.slice(start, start + itemsPerPage);
//   }, [sortedProducts, currentPage]);

//   return (
//     <div className="min-h-screen">
//       {/* Banner */}
//       <div className="w-full h-[250px] relative">
//         <Image src="/shopPage2.jpg" alt="Shop Banner" fill className="object-cover rounded" />
//       </div>

//       <div className="mt-6 px-4 flex flex-col gap-4">
//         {/* Header: Filter & Sort */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
//           <div className="bg-[#966ad7] border sm:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
//             <h1 className="text-base flex gap-1 font-semibold text-white">
//               <Funnel /> Filter
//             </h1>
//           </div>
//           <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
//         </div>

//         {/* Search Query Info */}
//         {searchQuery && (
//           <div className="flex items-center justify-between mt-2 flex-wrap">
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

//         {/* Layout */}
//         <div className="flex flex-col lg:flex-row gap-4">
//           {/* Sidebar Filters */}
//           <SidebarFiltersClient
//             categories={categories}
//             selectedCategories={Array.from(selectedCategories)}
//             onCategoryChange={handleCategoryChange}
//             priceRange={priceRange}
//             onPriceChange={setPriceRange}
//           />

//           {/* Product Grid + Pagination */}
//           <div className="flex-1 flex flex-col min-h-[500px] justify-between">
//             {loading ? (
//               <div className="text-center mt-10 text-gray-500">Loading products...</div>
//             ) : (
//               <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                 {paginatedProducts.length > 0 ? (
//                   paginatedProducts.map((product) => (
//                     <ProductCard key={product.id} product={product} />
//                   ))
//                 ) : (
//                   <p className="col-span-full text-center text-gray-500">No products found.</p>
//                 )}
//               </div>
//             )}

//             {/* Pagination Controls */}
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
//                   onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

// import { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';

// interface Category {
//   id: number;
//   name: string;
// }

// interface Product {
//   id: number;
//   name: string;
//   images: { image: string }[];
//   sellingPrice: number;
// }

// interface Props {
//   categories: Category[];
// }

// const ShopPageClient: React.FC<Props> = ({ categories }) => {
//   const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);

//   const searchParams = useSearchParams();
//   const search = searchParams.get('search') || '';

//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       let url: URL;

//       if (selectedCategories.size === 0) {
//         url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/product`);
//       } else {
//         url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/category/id`);
//         Array.from(selectedCategories).forEach((id) =>
//           url.searchParams.append('category', id.toString())
//         );
//       }

//       url.searchParams.append('page', currentPage.toString());

//       if (search) {
//         url.searchParams.append('search', search);
//       }

//       const res = await fetch(url.toString());
//       const data = await res.json();

//       const fetchedProducts = data.products || data.data?.products || [];
//       setProducts(fetchedProducts);
//     } catch (err) {
//       console.error('Failed to fetch products:', err);
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCategories, currentPage, search]);

//   const handleCategoryToggle = (id: number) => {
//     setCurrentPage(1);
//     setSelectedCategories((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(id)) {
//         newSet.delete(id);
//       } else {
//         newSet.add(id);
//       }
//       return newSet;
//     });
//   };

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Shop</h1>

//       {/* Categories */}
//       <div className="mb-4 flex flex-wrap gap-4">
//         {categories.map((cat) => (
//           <label key={cat.id} className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               checked={selectedCategories.has(cat.id)}
//               onChange={() => handleCategoryToggle(cat.id)}
//             />
//             <span>{cat.name}</span>
//           </label>
//         ))}
//       </div>

//       {/* Products */}
//       {loading ? (
//         <p>Loading products...</p>
//       ) : products.length === 0 ? (
//         <p>No products found.</p>
//       ) : (
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//           {products.map((product) => (
//             <div key={product.id} className="border p-4 rounded">
//               <img
//                 src={product.images?.[0]?.image || '/placeholder.png'}
//                 alt={product.name}
//                 className="w-full h-40 object-cover mb-2"
//               />
//               <h2 className="text-sm font-medium">{product.name}</h2>
//               <p className="text-sm text-gray-600">₹{product.sellingPrice}</p>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Pagination */}
//       <div className="mt-6 flex gap-4 items-center">
//         <button
//           onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//           disabled={currentPage === 1}
//           className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
//         >
//           Previous
//         </button>
//         <span>Page {currentPage}</span>
//         <button
//           onClick={() => setCurrentPage((prev) => prev + 1)}
//           className="px-3 py-1 bg-gray-200 rounded"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ShopPageClient;











// 'use client';

// import { useEffect, useState, useMemo } from 'react';
// import { useSearchParams } from 'next/navigation';
// import SidebarFiltersClient from '@/components/ServersideComponent/SidebarFilters/SidebarFilters';
// import { Category } from '@/types/category';
// import ProductCard from '@/components/CommonComponents/ProductCard/ProductCard';
// import { Product } from '@/types/product';





// interface Props {
//   categories: Category[];
// }

// const ShopPageClient: React.FC<Props> = ({ categories }) => {
//   const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
//   const [priceRange, setPriceRange] = useState<[number, number]>([10, 3999]); // optional
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);

//   const searchParams = useSearchParams();
//   const search = searchParams.get('search') || '';

//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       let url: URL;

//       if (selectedCategories.size === 0) {
//         url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/product`);
//       } else {
//         url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/category/id`);
//         Array.from(selectedCategories).forEach((id) =>
//           url.searchParams.append('category', id.toString())
//         );
//       }

//       url.searchParams.append('page', currentPage.toString());

//       if (search) {
//         url.searchParams.append('search', search);
//       }

//       const res = await fetch(url.toString());
//       const data = await res.json();

//       const fetchedProducts = data.products || data.data?.products || [];
//       setProducts(fetchedProducts);
//     } catch (err) {
//       console.error('Failed to fetch products:', err);
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCategories, currentPage, search]);

//   const handleCategoryToggle = (id: number) => {
//     setCurrentPage(1);
//     setSelectedCategories((prev) => {
//       const newSet = new Set(prev);
//       newSet.has(id) ? newSet.delete(id) : newSet.add(id);
//       return newSet;
//     });
//   };

//   // Optional: Apply price filtering on client side
//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const price = Number(product.sellingPrice); // Convert string to number
  
//       const matchesPrice =
//         price >= priceRange[0] && price <= priceRange[1];
  
//       const matchesCategory =
//         selectedCategories.size === 0 ||
//         selectedCategories.has(product.category?.id ?? -1);
  
//       return matchesPrice && matchesCategory;
//     });
//   }, [products, priceRange, selectedCategories]);
  

//   return (
//     <div className="flex flex-col lg:flex-row gap-6 px-4">
//       {/* Sidebar Filters */}
//       <SidebarFiltersClient
//         categories={categories}
//         selectedCategories={Array.from(selectedCategories)}
//         onCategoryChange={handleCategoryToggle}
//         priceRange={priceRange}
//         onPriceChange={setPriceRange}
//       />

//       {/* Main Content */}
//       <div className="flex-1">
//         <h1 className="text-2xl font-bold mb-4">Shop</h1>

//         {loading ? (
//           <p>Loading products...</p>
//         ) : filteredProducts.length === 0 ? (
//           <p>No products found.</p>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//           {filteredProducts.map((product) => (
//             <ProductCard key={product.id} product={product} />
//           ))}
//         </div>
//         )}

//         {/* Pagination */}
//         <div className="mt-6 flex gap-4 items-center">
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <span>Page {currentPage}</span>
//           <button
//             onClick={() => setCurrentPage((prev) => prev + 1)}
//             className="px-3 py-1 bg-gray-200 rounded"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ShopPageClient;










// 'use client';

// import { useEffect, useState, useMemo } from 'react';
// import { useSearchParams } from 'next/navigation';
// import SidebarFiltersClient from '@/components/ServersideComponent/SidebarFilters/SidebarFilters';
// import { Category } from '@/types/category';
// import ProductCard from '@/components/CommonComponents/ProductCard/ProductCard';
// import { Product } from '@/types/product';
// import Image from 'next/image';
// import { Funnel } from 'lucide-react';
// import SortDropdown from '../SortDropdown.tsx/SortDropdown';


// interface Props {
//   categories: Category[];
// }


// type SortOrder = 'price_asc' | 'price_desc';

// const ShopPageClient: React.FC<Props> = ({ categories }) => {
//   const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
//   const [priceRange, setPriceRange] = useState<[number, number]>([10, 3999]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//     const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');
  

//   const searchParams = useSearchParams();
//   const search = searchParams.get('search') || '';

//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/product`);

//       // Add selected categories
//       Array.from(selectedCategories).forEach((id) =>
//         url.searchParams.append('category', id.toString())
//       );

//       // Add search and page query
//       if (search) {
//         url.searchParams.append('search', search);
//       }
//       url.searchParams.append('page', currentPage.toString());

//       console.log('Fetching products from:', url.toString());

//       const res = await fetch(url.toString());
//       const data = await res.json();

//       const fetchedProducts = data.products || data.data?.products || [];
//       setProducts(fetchedProducts);
//     } catch (err) {
//       console.error('Failed to fetch products:', err);
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCategories, currentPage, search]);

//   const handleCategoryToggle = (id: number) => {
//     setCurrentPage(1);
//     setSelectedCategories((prev) => {
//       const newSet = new Set(prev);
//       newSet.has(id) ? newSet.delete(id) : newSet.add(id);
//       return newSet;
//     });
//   };

//   // Apply price filter on client side
//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const price = Number(product.sellingPrice);
//       const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

//       const matchesCategory =
//         selectedCategories.size === 0 ||
//         selectedCategories.has(product.category?.id ?? -1);

//       return matchesPrice && matchesCategory;
//     });
//   }, [products, priceRange, selectedCategories]);




//   //   // Sorting
//   const sortedProducts = useMemo(() => {
//     return [...filteredProducts].sort((a, b) => {
//       const priceA = Number(a.sellingPrice);
//       const priceB = Number(b.sellingPrice);
//       return sortOrder === 'price_asc' ? priceA - priceB : priceB - priceA;
//     });
//   }, [filteredProducts, sortOrder]);

//   return (
//  <div className='min-h-screen"'>
// <div className="w-full h-[250px] relative rounded overflow-hidden">
//   <Image
//     src="/shopPage2.jpg"
//     alt="Shop Banner"
//     fill
//     className="object-cover"
//     priority // Optional: improves loading speed for banners
//     sizes="100vw"
//   />
// </div>
      

//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-1 py-2">
//            <div className="bg-[#966ad7] border sm:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
//              <h1 className="text-base flex gap-1 font-semibold text-white">
//              <Funnel /> Filter
//          </h1>
//           </div>
//           <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
//         </div>

      
  
    
//     <div className="flex flex-col lg:flex-row gap-6 px-4">

//       {/* Sidebar Filters */}
//       <SidebarFiltersClient
//         categories={categories}
//         selectedCategories={Array.from(selectedCategories)}
//         onCategoryChange={handleCategoryToggle}
//         priceRange={priceRange}
//         onPriceChange={setPriceRange}
//       />

//       {/* Main Content */}
//       <div className="flex-1 ">
//         {loading ? (
//           <p>Loading products...</p>
//         ) : filteredProducts.length === 0 ? (
//           <p>No products found.</p>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//             {filteredProducts.map((product) => (
//               <ProductCard key={product.id} product={product} />
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         <div className="mt-6 flex gap-4 items-center">
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <span>Page {currentPage}</span>
//           <button
//             onClick={() => setCurrentPage((prev) => prev + 1)}
//             className="px-3 py-1 bg-gray-200 rounded"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//       </div>
      
//     </div>
//   );
// };

// export default ShopPageClient;









// 'use client';

// import { useEffect, useState, useMemo } from 'react';
// import { useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import { Funnel } from 'lucide-react';

// import SidebarFiltersClient from '@/components/ServersideComponent/SidebarFilters/SidebarFilters';
// import ProductCard from '@/components/CommonComponents/ProductCard/ProductCard';
// import SortDropdown from '../SortDropdown.tsx/SortDropdown';

// import { Category } from '@/types/category';
// import { Product } from '@/types/product';

// interface Props {
//   categories: Category[];
// }

// type SortOrder = 'price_asc' | 'price_desc';

// const ShopPageClient: React.FC<Props> = ({ categories }) => {
//   const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
//   const [priceRange, setPriceRange] = useState<[number, number]>([10, 3999]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');

//   const searchParams = useSearchParams();
//   const search = searchParams.get('search') || '';

//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/product`);

//       Array.from(selectedCategories).forEach((id) =>
//         url.searchParams.append('category', id.toString())
//       );

//       if (search) {
//         url.searchParams.append('search', search);
//       }

//       url.searchParams.append('page', currentPage.toString());
//       url.searchParams.append('limit', '10')

//       const res = await fetch(url.toString());
//       const data = await res.json();

//       const fetchedProducts = data.products || data.data?.products || [];
//       setProducts(fetchedProducts);
//     } catch (err) {
//       console.error('Failed to fetch products:', err);
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCategories, currentPage, search]);

//   const handleCategoryToggle = (id: number) => {
//     setCurrentPage(1);
//     setSelectedCategories((prev) => {
//       const newSet = new Set(prev);
//       newSet.has(id) ? newSet.delete(id) : newSet.add(id);
//       return newSet;
//     });
//   };

//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const price = Number(product.sellingPrice);
//       const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
//       const matchesCategory =
//         selectedCategories.size === 0 ||
//         selectedCategories.has(product.category?.id ?? -1);

//       return matchesPrice && matchesCategory;
//     });
//   }, [products, priceRange, selectedCategories]);

//   const sortedProducts = useMemo(() => {
//     return [...filteredProducts].sort((a, b) => {
//       const priceA = Number(a.sellingPrice);
//       const priceB = Number(b.sellingPrice);
//       return sortOrder === 'price_asc' ? priceA - priceB : priceB - priceA;
//     });
//   }, [filteredProducts, sortOrder]);

//   return (
//     <div className="min-h-screen container mx-auto">
//       <div className="w-full h-[250px] relative rounded overflow-hidden">
//         <Image
//           src="/shopPage2.jpg"
//           alt="Shop Banner"
//           fill
//           className="object-cover"
//           priority
//           sizes="100vw"
//         />
//       </div>

//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-1 py-2 px-4">
//         <div className="bg-[#966ad7] border sm:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
//           <h1 className="text-base flex gap-1 font-semibold text-white">
//             <Funnel /> Filter
//           </h1>
//         </div>
//         <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6 px-4">
//         {/* Sidebar Filters */}
//         <SidebarFiltersClient
//           categories={categories}
//           selectedCategories={Array.from(selectedCategories)}
//           onCategoryChange={handleCategoryToggle}
//           priceRange={priceRange}
//           onPriceChange={setPriceRange}
//         />

//         {/* Main Content */}
//         <div className="flex-1">
//           {loading ? (
//             <p>Loading products...</p>
//           ) : sortedProducts.length === 0 ? (
//             <p>No products found.</p>
//           ) : (
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//               {sortedProducts.map((product) => (
//                 <ProductCard key={product.id} product={product} />
//               ))}
//             </div>
//           )}

//           {/* Pagination */}
//           <div className="mt-6 flex gap-4 items-center">
//             <button
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
//             >
//               Previous
//             </button>
//             <span>Page {currentPage}</span>
//             <button
//               onClick={() => setCurrentPage((prev) => prev + 1)}
//               className="px-3 py-1 bg-gray-200 rounded"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ShopPageClient;










// 'use client';

// import { useEffect, useState, useMemo } from 'react';
// import { useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import { Funnel } from 'lucide-react';

// import SidebarFiltersClient from '@/components/ServersideComponent/SidebarFilters/SidebarFilters';
// import ProductCard from '@/components/CommonComponents/ProductCard/ProductCard';
// import SortDropdown from '../SortDropdown.tsx/SortDropdown';

// import { Category } from '@/types/category';
// import { Product } from '@/types/product';

// interface Props {
//   categories: Category[];
// }

// type SortOrder = 'price_asc' | 'price_desc';

// const PRODUCTS_PER_PAGE = 10;

// const ShopPageClient: React.FC<Props> = ({ categories }) => {
//   const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
//   const [priceRange, setPriceRange] = useState<[number, number]>([10, 3999]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');

//   const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

//   const searchParams = useSearchParams();
//   const search = searchParams.get('search') || '';

//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/product`);

//       Array.from(selectedCategories).forEach((id) =>
//         url.searchParams.append('category', id.toString())
//       );

//       if (search) {
//         url.searchParams.append('search', search);
//       }

//       url.searchParams.append('page', currentPage.toString());
//       url.searchParams.append('limit', PRODUCTS_PER_PAGE.toString());

//       const res = await fetch(url.toString());
//       const data = await res.json();

//       const fetchedProducts = data.products || data.data?.products || [];
//       const total = data.total || data.data?.total || 0;

//       setProducts(fetchedProducts);
//       setTotalCount(total);
//     } catch (err) {
//       console.error('Failed to fetch products:', err);
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedCategories, currentPage, search]);

//   const handleCategoryToggle = (id: number) => {
//     setCurrentPage(1);
//     setSelectedCategories((prev) => {
//       const newSet = new Set(prev);
//       newSet.has(id) ? newSet.delete(id) : newSet.add(id);
//       return newSet;
//     });
//   };

//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const price = Number(product.sellingPrice);
//       const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
//       const matchesCategory =
//         selectedCategories.size === 0 ||
//         selectedCategories.has(product.category?.id ?? -1);

//       return matchesPrice && matchesCategory;
//     });
//   }, [products, priceRange, selectedCategories]);

//   const sortedProducts = useMemo(() => {
//     return [...filteredProducts].sort((a, b) => {
//       const priceA = Number(a.sellingPrice);
//       const priceB = Number(b.sellingPrice);
//       return sortOrder === 'price_asc' ? priceA - priceB : priceB - priceA;
//     });
//   }, [filteredProducts, sortOrder]);

//   // Optional: Fallback if current page is invalid
//   useEffect(() => {
//     if (!loading && products.length === 0 && currentPage > 1) {
//       setCurrentPage((prev) => Math.max(prev - 1, 1));
//     }
//   }, [products, loading, currentPage]);

//   return (
//     <div className="min-h-screen container mx-auto">
//       <div className="w-full h-[250px] relative rounded overflow-hidden">
//         <Image
//           src="/shopPage2.jpg"
//           alt="Shop Banner"
//           fill
//           className="object-cover"
//           priority
//           sizes="100vw"
//         />
//       </div>

//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-1 py-2 px-4">
//         <div className="bg-[#966ad7] border sm:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
//           <h1 className="text-base flex gap-1 font-semibold text-white">
//             <Funnel /> Filter
//           </h1>
//         </div>
//         <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6 px-4">
//         {/* Sidebar Filters */}
//         <SidebarFiltersClient
//           categories={categories}
//           selectedCategories={Array.from(selectedCategories)}
//           onCategoryChange={handleCategoryToggle}
//           priceRange={priceRange}
//           onPriceChange={setPriceRange}
//         />

//         {/* Main Content */}
//         <div className="flex-1">
//           {loading ? (
//             <p>Loading products...</p>
//           ) : sortedProducts.length === 0 ? (
//             <p>No products found.</p>
//           ) : (
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//               {sortedProducts.map((product) => (
//                 <ProductCard key={product.id} product={product} />
//               ))}
//             </div>
//           )}

//           {/* Pagination */}
//           <div className="mt-6 flex gap-4 items-center">
//             <button
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
//             >
//               Previous
//             </button>
//             <span>Page {currentPage} of {totalPages}</span>
//             <button
//               onClick={() => setCurrentPage((prev) => prev + 1)}
//               disabled={currentPage >= totalPages}
//               className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ShopPageClient;





'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Funnel } from 'lucide-react';

import SidebarFiltersClient from '@/components/ServersideComponent/SidebarFilters/SidebarFilters';
import ProductCard from '@/components/CommonComponents/ProductCard/ProductCard';
import SortDropdown from '../SortDropdown.tsx/SortDropdown';

import { Category } from '@/types/category';
import { Product } from '@/types/product';

interface Props {
  categories: Category[];
}

type SortOrder = 'price_asc' | 'price_desc';

const PRODUCTS_PER_PAGE = 8;

const ShopPageClient: React.FC<Props> = ({ categories }) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 3999]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');

  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';

  // Fetch all products once based on search and selected categories
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/product`);

      Array.from(selectedCategories).forEach((id) =>
        url.searchParams.append('category', id.toString())
      );

      if (search) {
        url.searchParams.append('search', search);
      }

      const res = await fetch(url.toString());
      const data = await res.json();

      const fetchedProducts = data.products || data.data?.products || [];
      setAllProducts(fetchedProducts);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, search]);

  const handleCategoryToggle = (id: number) => {
    setCurrentPage(1);
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  // Filter by price and category on frontend
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const price = Number(product.sellingPrice);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const matchesCategory =
        selectedCategories.size === 0 ||
        selectedCategories.has(product.category?.id ?? -1);

      return matchesPrice && matchesCategory;
    });
  }, [allProducts, priceRange, selectedCategories]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = Number(a.sellingPrice);
      const priceB = Number(b.sellingPrice);
      return sortOrder === 'price_asc' ? priceA - priceB : priceB - priceA;
    });
  }, [filteredProducts, sortOrder]);

  // Paginate sorted products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return sortedProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);

  return (
    <div className="min-h-screen container mx-auto">
      <div className="w-full h-[250px] relative rounded overflow-hidden">
        <Image
          src="/shopPage2.jpg"
          alt="Shop Banner"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-1 py-2 px-4">
        <div className="bg-[#966ad7] border sm:w-1/5 w-full border-gray-300 rounded h-12 flex items-center px-4 shadow-sm">
          <h1 className="text-base flex gap-1 font-semibold text-white">
            <Funnel /> Filter
          </h1>
        </div>
        <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 px-4">
        {/* Sidebar Filters */}
        <SidebarFiltersClient
          categories={categories}
          selectedCategories={Array.from(selectedCategories)}
          onCategoryChange={handleCategoryToggle}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
        />

        {/* Main Content */}
        <div className="flex-1">
          {loading ? (
            <p>Loading products...</p>
          ) : paginatedProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="mt-6 flex gap-4 items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPageClient;
