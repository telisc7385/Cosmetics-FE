// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Category } from '@/types/category';
// import { Product } from '@/types/product';
// import ProductCard from '../../CommonComponents/ProductCard/ProductCard';

// type Props = {
//   categories: Category[];
// };

// export default function TopCategoriesClient({ categories }: Props) {
//   const [selectedId, setSelectedId] = useState<number | null>(null);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);

//   // Auto-select first category
//   useEffect(() => {
//     if (categories.length > 0) {
//       setSelectedId(categories[0].id);
//     }
//   }, [categories]);

//   // Fetch products by category ID
//   useEffect(() => {
//     const fetchProductsByCategory = async () => {
//       if (selectedId === null) return;

//       try {
//         setLoading(true);
//         const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category/${selectedId}`);
//         const json = await res.json();
//         setFilteredProducts(json.category?.products || []);
//       } catch (error) {
//         console.error('Error fetching products by category:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProductsByCategory();
//   }, [selectedId]);

//   return (
//     <section className=" container mx-auto py-8 px-10 bg-gray-50">
//       <div className="mb-5">
//         <h2 className="text-3xl font-bold mb-2">Top Category Picks</h2>
//         <p className="text-gray-600">Discover the best products from our top categories.</p>
//         <hr className="my-4" />
//       </div>

//       <div className="  flex flex-wrap gap-3 mb-6">
//         {categories.map((category) => (
//           <button
//             key={category.id}
//             onClick={() => setSelectedId(category.id)}
//             className={`px-4 py-2 rounded-full transition cursor-pointer ${
//               selectedId === category.id
//                 ? 'bg-purple-600 text-white'
//                 : 'bg-gray-200 text-gray-800'
//             }`}
//           >
//             {category.name}
//           </button>
//         ))}
//       </div>

//       {loading ? (
//         <p className="text-gray-600">Loading products...</p>
//       ) : filteredProducts.length > 0 ? (
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
//           {filteredProducts.map((product) => (
//             <ProductCard key={product.id} product={product} />
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-500">No products found in this category.</p>
//       )}
//     </section>
//   );
// }



'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '@/types/category';
import { Product } from '@/types/product';
import ProductCard from '../../CommonComponents/ProductCard/ProductCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

type Props = {
  categories: Category[];
};

export default function TopCategoriesClient({ categories }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedId(categories[0].id);
    }
  }, [categories]);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      if (selectedId === null) return;

      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category/${selectedId}`);
        const json = await res.json();
        setFilteredProducts(json.category?.products || []);
      } catch (error) {
        console.error('Error fetching products by category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [selectedId]);

  return (
    <section className="py-8 px-10 bg-gray-50">
      <div className="mb-5">
        <h2 className="text-3xl font-bold mb-2">Top Category Picks</h2>
        <p className="text-gray-600">Discover the best products from our top categories.</p>
        <hr className="my-4" />
      </div>
      <div className='container mx-auto'> 
      <div className=" flex flex-wrap gap-3 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedId(category.id)}
            className={`px-4 py-2 rounded-full transition cursor-pointer ${
              selectedId === category.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-600">Loading products...</p>
      ) : filteredProducts.length > 5 ? (
        <Swiper
          modules={[Navigation]}
          spaceBetween={10}
          slidesPerView={2}
          navigation
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
          }}
        >
          {filteredProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No products found in this category.</p>
        )}     
        </div>
    </section>
  );
}
