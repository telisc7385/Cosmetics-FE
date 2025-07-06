// "use client";

// import React, { useState, useEffect } from "react";
// import { Category } from "@/types/category";
// import { Product } from "@/types/product";
// import ProductCard from "../../CommonComponents/ProductCard/ProductCard";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation } from "swiper/modules";

// import "swiper/css";
// import "swiper/css/navigation";

// type Props = {
//   categories: Category[];
// };

// export default function TopCategoriesClient({ categories }: Props) {
//   const [selectedId, setSelectedId] = useState<number | null>(null);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);

//   useEffect(() => {
//     if (categories.length > 0) {
//       setSelectedId(categories[0].id);
//     }
//   }, [categories]);

//   useEffect(() => {
//     const fetchProductsByCategory = async () => {
//       if (selectedId === null) return;

//       try {
//         setLoading(true);
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_BASE_URL}/category/${selectedId}`
//         );
//         const json = await res.json();
//         setFilteredProducts(json.category?.products || []);
//       } catch (error) {
//         console.error("Error fetching products by category:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProductsByCategory();
//   }, [selectedId]);

//   return (
//     <section className="py-8 px-4 md:px-10 bg-gray-50 container mx-auto">
//       <div className="">
//         <div className="mb-5">
//           <h2 className="text-3xl font-bold mb-2">Top Category Picks</h2>
//           <p className="text-gray-600">
//             Discover the best products from our top categories.
//           </p>
//           <hr className="my-4" />
//         </div>

//         <div className="flex flex-wrap gap-3 mb-6">
//           {categories.map((category) => (
//             <button
//               key={category.id}
//               onClick={() => setSelectedId(category.id)}
//               className={`px-4 py-2 rounded-full transition cursor-pointer ${
//                 selectedId === category.id
//                   ? "bg-purple-600 text-white"
//                   : "bg-gray-200 text-gray-800"
//               }`}
//             >
//               {category.name}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <p className="text-gray-600">Loading products...</p>
//         ) : filteredProducts.length > 0 ? (
//           filteredProducts.length > 5 ? (
//             <Swiper
//               modules={[Navigation]}
//               navigation
//               spaceBetween={20} // ✅ increased spacing between slides
//               slidesPerView={1}
//               breakpoints={{
//                 640: { slidesPerView: 1 },
//                 768: { slidesPerView: 3 },
//                 1024: { slidesPerView: 5 },
//               }}
//             >
//               {filteredProducts.map((product) => (
//                 <SwiperSlide key={product.id}>
//                   <div className="py-4 px-2">
//                     {" "}
//                     {/* ✅ vertical and horizontal spacing */}
//                     <ProductCard product={product} />
//                   </div>
//                 </SwiperSlide>
//               ))}
//             </Swiper>
//           ) : (
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
//               {filteredProducts.map((product) => (
//                 <div key={product.id} className="py-4 px-2">
//                   {" "}
//                   {/* ✅ consistent spacing for grid */}
//                   <ProductCard product={product} />
//                 </div>
//               ))}
//             </div>
//           )
//         ) : (
//           <p className="text-gray-500">No products found in this category.</p>
//         )}
//       </div>
//     </section>
//   );
// }






"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import ProductCard from "../../CommonComponents/ProductCard/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

type Props = {
  categories: Category[];
};

export default function TopCategoriesClient({ categories }: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedIds([categories[0].id]); // default select first category
    }
  }, [categories]);

  // useEffect(() => {
  //   const fetchProductsByCategories = async () => {
  //     if (selectedIds.length === 0) return;

  //     try {
  //       setLoading(true);

  //       const params = new URLSearchParams();
  //       selectedIds.forEach((id) => params.append("category", id.toString()));
  //       params.append("page", "1");

  //       const res = await fetch(
  //         `${process.env.NEXT_PUBLIC_BASE_URL}/category/id?${params.toString()}`
  //       );
  //       const json = await res.json();

  //       console.log("Fetched response:", json);
  //       setFilteredProducts(json.products || []);
  //     } catch (error) {
  //       console.error("Error fetching products by category:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProductsByCategories();
  // }, [selectedIds]);



  useEffect(() => {
    const fetchProductsByCategories = async () => {
      if (selectedIds.length === 0) return;
  
      try {
        setLoading(true);
  
        const params = new URLSearchParams();
        selectedIds.forEach((id) => params.append("category", id.toString()));
        params.append("page", "1");
  
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/category/id?${params.toString()}`
        );
  
        const json = await res.json();
        console.log("Fetched response:", json);
  
        setFilteredProducts(json.data?.products || []);
      } catch (error) {
        console.error("Error fetching products by category:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProductsByCategories();
  }, [selectedIds]);
  



  const toggleCategory = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-8 px-4 md:px-10 bg-gray-50 container mx-auto">
      <div>
        <div className="mb-5">
          <h2 className="text-3xl font-bold mb-2">Top Category Picks</h2>
          <p className="text-gray-600">
            Discover the best products from our top categories.
          </p>
          <hr className="my-4" />
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`px-4 py-2 rounded-full transition cursor-pointer ${
                selectedIds.includes(category.id)
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-600">Loading products...</p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.length > 5 ? (
            <Swiper
              modules={[Navigation]}
              navigation
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 5 },
              }}
            >
              {filteredProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <div className="py-4 px-2">
                    <ProductCard product={product} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="py-4 px-2">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )
        ) : (
          <p className="text-gray-500">No products found in this category.</p>
        )}
      </div>
    </section>
  );
}
