// components/Footer.tsx
import { Category } from "@/types/category";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";




const Footer = ({ topCategories,newArrivals }: { topCategories: Category[];  newArrivals: Product[]; }) => {
  return (
    <footer className="bg-white border-t text-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-5 gap-6 text-[15px]">
        {/* Column 1: Logo + Slogan (always first) */}
        <div className="text-center col-span-full lg:col-span-1">
          <Image
            src="/logo1.png"
            alt="Site Logo"
            width={180}
            height={70}
            className="mx-auto "
          />
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
            Skincare that soothes, makeup that empowers. Designed to bring out
            your best.
          </p>
        </div>

        {/* Wrapper for remaining columns (2-5), inline on lg */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 col-span-full lg:contents">
          {/* Column 2: About */}
          <div className="text-center lg:text-left">
            <h4 className="font-semibold text-base mb-4 text-black">About</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="cursor-pointer hover:text-black">About Us</li>
              <li className="cursor-pointer hover:text-black">Careers</li>
            </ul>
          </div>

          {/* Column 3: Help */}
          <div className="text-center lg:text-left">
            <h4 className="font-semibold text-base mb-4 text-black">Help</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="cursor-pointer hover:text-black">Contact Us</li>
              <li className="cursor-pointer hover:text-black">FAQs</li>
              <li className="cursor-pointer hover:text-black">
                Cancellation & Return
              </li>
              <li className="cursor-pointer hover:text-black">
                Shipping & Delivery
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Links */}
          <div className="text-center lg:text-left">
            <h4 className="font-semibold text-base mb-4 text-black">
              Quick Links
            </h4>
            <ul className="space-y-2 text-gray-600">
              {newArrivals.length > 0 ? (
                newArrivals.map((product) => (
                  <li key={product.id} className="cursor-pointer hover:text-black">
                    <Link href={`/product/${product.slug}`}>{product.name}</Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 italic">No new arrivals</li>
              )}
            </ul>
          </div>

          {/* Column 5: Top Categories */}
          <div className="text-center lg:text-left">
            <h4 className="font-semibold text-base mb-4 text-black">
              Top Categories
            </h4>
            <ul className="space-y-2 text-gray-600">
              {topCategories.map((category) => (
                <li key={category.id} className="cursor-pointer hover:text-black">
                  {category.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t py-4 text-center text-sm text-gray-600">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-2">
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
          <span className="hover:underline cursor-pointer">
            Terms & Conditions
          </span>
          <span className="hover:underline cursor-pointer">
            Shipping Policy
          </span>
          <span className="hover:underline cursor-pointer">
            Cancellation Policy
          </span>
        </div>
        <p className="text-xs text-gray-500">
          © 2025 ReadymadeUI. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
