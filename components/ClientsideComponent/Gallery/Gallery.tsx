"use client";

import Image from "next/image";
import { GalleryImage } from "@/types/gallery";

const Gallery = ({ images }: { images: GalleryImage[] }) => {
  return (
    <div className="w-[100%] mx-auto sm:container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 h-auto md:h-[500px]">
      {images.map((img, index) => {
        const isLarge = index === 0 || index === 3;
        return (
          <div
            key={img.id}
            className={`
              overflow-hidden rounded-lg relative
              ${isLarge ? "md:col-span-2 md:row-span-2" : ""}
              h-[200px] md:h-auto
            `}
          >
            <Image
              src={img.image}
              alt={`Gallery ${img.id}`}
              className="object-cover transition-transform duration-300 hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        );
      })}
    </div>
  );
};

export default Gallery;
