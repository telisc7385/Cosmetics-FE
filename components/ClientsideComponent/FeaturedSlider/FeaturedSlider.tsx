'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  sellingPrice: string;
  basePrice: string;
  stock: number;
  slug: string;
  images: { image: string }[];
  category: { name: string };
}

export default function FeaturedSlider({ products }: { products: Product[] }) {
  return (
    <div className="bg-[#e3e9f1] py-3 px-6">

      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        autoplay={{ delay: 5000 }}
        loop
      >
        {products.map((product) => {
          // const discount = Math.round(
          //   ((+product.basePrice - +product.sellingPrice) / +product.basePrice) * 100
          // );

          return (
            <SwiperSlide key={product.id}>
              <div className="flex items-center gap-10 h-[350px] px-[40px]">
                {/* Product Image */}
                <div className="relative w-1/2 flex items-center justify-center">
                  {/* {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      -{discount}% off
                    </span>
                  )} */}
                  <Image
                    src={product.images[0]?.image || '/placeholder.jpg'}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="rounded w-[350px] h-[350px] object-contain overflow-hidden"
                  />
                </div>

                {/* Product Info */}
                <div className="w-1/2">
                  <p className="text-sm text-gray-500">{product.category?.name}</p>
                  <h3 className="text-2xl font-bold">{product.name}</h3>
                  <p className="text-[#e60076] font-semibold text-xl mt-2">
                    ₹{product.sellingPrice}
                    <span className="line-through text-gray-500 text-sm ml-2">
                      ₹{product.basePrice}
                    </span>
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    ● In Stock ({product.stock} available)
                  </p>
                  <div className="mt-4 flex gap-2">
                  <Link href={`/product/${product.slug}`} className="block">
                    <button className="px-4 py-2 border  text-gray-600 rounded cursor-pointer ">
                      Select Variant
                      </button>
                   </Link>
                    <button className="px-4 py-2 border text-gray-600 rounded hover:bg-gray-100">
                      Wishlist
                    </button>
                    <Link
                      href={`/product/${product.slug}`} 
                      className="px-4 py-2 border text-gray-600 rounded hover:bg-gray-100 cursor-pointer"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
