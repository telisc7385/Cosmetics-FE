"use client";

import Image from "next/image";
import Link from "next/link";
import { FaLeaf, FaPumpSoap, FaTint } from "react-icons/fa";

const DiscoverBeauty = () => {
  return (
    <section className="bg-[#fdf7f0] py-10 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
        {/* Left Content */}
        <div className="w-full md:w-1/2">
          <p className="text-sm uppercase tracking-widest text-gray-700 mb-1 md:mb-2">
            Discover Beauty
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#1e1e1e] mb-2 md:mb-4">
            Daily Essentials Makeup Range
          </h2>
          <p className="text-gray-700 mb-3 md:mb-6 text-sm">
            Nullam euismod purus quis blandit eleifend. Nullam egestas, diam ut
            ornare ultrices, nibh metus feugiat ante, id scelerisque ague est.
          </p>

          {/* Feature 1 */}
          <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-6">
            <FaLeaf className="text-xl md:text-2xl text-[#c2824f]" />
            <div>
              <h4 className="text-base md:text-lg font-semibold text-[#1e1e1e]">
                Lightweight Formula
              </h4>
              <p className="text-gray-600 text-sm">
                Duis eleifend ipsum a justo vehicula, ut vestibulum sem
                volutpat. Donec at aliquam purus. Mauris.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-6">
            <FaPumpSoap className="text-xl md:text-2xl text-[#c2824f]" />
            <div>
              <h4 className="text-base md:text-lg font-semibold text-[#1e1e1e]">
                Hygienically Manufactured
              </h4>
              <p className="text-gray-600 text-sm">
                Auis eleifend ipsum a justo vehicula, ut vestibulum sem
                volutpat. Donec at aliquam purus. Mauris.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-6">
            <FaTint className="text-xl md:text-2xl text-[#c2824f]" />
            <div>
              <h4 className="text-base md:text-lg font-semibold text-[#1e1e1e]">
                In-house Quality Control
              </h4>
              <p className="text-gray-600 text-sm">
                Fois eleifend ipsum a justo vehicula, ut vestibulum sem
                volutpat. Donec at aliquam purus. Mauris.
              </p>
            </div>
          </div>

          {/* Button with mobile-specific smaller size */}
          <button className="mt-3 mb-4 md:mb-0 px-3 py-1.5 md:px-6 md:py-3 relative overflow-hidden border border-[#213E5A] text-[#213E5A] hover:cursor-pointer text-sm tracking-widest uppercase rounded z-10 group">
            <span className="relative z-20 transition-colors duration-500 group-hover:text-white">
              <Link href="#">Read More</Link>
            </span>
            <span className="absolute inset-0 w-0 bg-[#213E5A] transition-all duration-500 group-hover:w-full z-10"></span>
          </button>
        </div>

        {/* Right Image with border and mobile horizontal padding */}
        <div className="w-full md:w-1/2 relative flex justify-center px-4 md:px-0">
          <div className="relative z-10 shadow-xl rounded-md overflow-hidden">
            <Image
              src="/discoverBeauty.webp"
              alt="Facial Treatment"
              width={600}
              height={400}
              className="rounded-md"
            />
          </div>

          {/* Border behind the image with mobile-only padding */}
          <div className="absolute inset-4 px-5 md:px-0 md:-inset-6 -top-6 -right-6 w-full h-full z-0">
            <div className="w-full h-full border-8 border-[#e8dbc0] rounded-md"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverBeauty;
