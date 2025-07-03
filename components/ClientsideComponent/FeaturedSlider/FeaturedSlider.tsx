'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';

// interface Product {
//   id: number;
//   name: string;
//   sellingPrice: string;
//   basePrice: string;
//   stock: number;
//   slug: string;
//   images: { image: string }[];
//   category: { name: string };
// }

export default function FeaturedSlider({ products }: { products: Product[] }) {
  return (
    <div className="bg-[#e3e9f1] py-6 px-4 sm:px-6 lg:px-10">
      <div className="container mx-auto">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          autoplay={{ delay: 5000 }}
          loop
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 min-h-[400px] lg:min-h-[350px] px-2 sm:px-6 lg:px-10">
                {/* Product Image */}
                <div className="relative w-full lg:w-1/2 flex justify-center">
                  <Image
                    src={product.images[0]?.image || '/placeholder.jpg'}
                    alt={product.name}
                    width={350}
                    height={350}
                    className="rounded w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] lg:w-[350px] lg:h-[350px] object-contain"
                  />
                </div>

                {/* Product Info */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                  <p className="text-sm text-gray-500">{product.category?.name}</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1">{product.name}</h3>
                  <p className="text-[#e60076] font-semibold text-lg sm:text-xl mt-2">
                    ₹{product.sellingPrice}
                    <span className="line-through text-gray-500 text-sm ml-2">
                      ₹{product.basePrice}
                    </span>
                  </p>
                 
                  <p
  className="mt-2 text-gray-700 text-sm"
  dangerouslySetInnerHTML={{ __html: product.description }}
></p>
                  <p className="text-sm text-green-700 mt-1">
                    ● In Stock ({product.stock} available)
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center lg:justify-start">
                    <button className="px-4 py-2 border text-gray-600 rounded hover:bg-gray-100">
                      Wishlist
                    </button>
                    <Link
                      href={`/product/${product.slug}`}
                      className="px-4 py-2 border text-gray-600 rounded hover:bg-gray-100 text-center"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
