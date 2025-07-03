'use client';

import Image from "next/image";
import { GalleryImage } from "@/types/gallery";

const Gallery = ({ images }: { images: GalleryImage[] }) => {
  return (
    <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 h-[500px]">
      {images.map((img, index) => {
        const isLarge = index === 0 || index === 3;
        return (
          <div
            key={img.id}
            className={`overflow-hidden rounded-lg relative ${
              isLarge ? 'md:col-span-2 md:row-span-2' : ''
            }`}
          >
            <Image
              src={img.image}
              alt={`Gallery ${img.id}`}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              fill
            />
          </div>
        );
      })}
    </div>
  );
};

export default Gallery;




