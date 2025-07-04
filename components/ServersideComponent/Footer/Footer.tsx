import { Category } from "@/types/category";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { getCompanySettings } from "@/api/CompanyApi";
import { getNavbarData } from "@/api/NavbarApi";
import { NavItem } from "@/types/nav";

const Footer = async ({
  topCategories,
  newArrivals,
}: {
  topCategories: Category[];
  newArrivals: Product[];
}) => {
  const settingsRes = await getCompanySettings();
  const company = settingsRes?.result?.[0];

  let navItems: NavItem[] = [];
  try {
    const navResponse = await getNavbarData();
    if (Array.isArray(navResponse.result)) {
      navItems = navResponse.result.filter((item) => item.is_active);
    }
  } catch (error) {
    console.error("Footer: Failed to fetch nav items:", error);
  }

  return (
    <footer className="bg-white border-t text-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-[15px]">
          {/* Column 1: Logo + Description */}
          <div className="lg:col-span-1 text-center lg:text-left">
            <Image
              src={company?.logo || "/logo1.png"}
              alt="Site Logo"
              width={180}
              height={70}
              className="mx-auto lg:mx-0"
            />
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto lg:mx-0 mt-2">
              {company.description}
            </p>
          </div>

          {/* Columns 2 to 5: All aligned in laptop view */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Quick Links */}
            <div className="text-center lg:text-left">
              <h4 className="font-semibold text-base mb-4 text-black">
                Quick Links
              </h4>
              <ul className="space-y-2 text-gray-600">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <Link href={item.link || "#"}>
                      <span className="cursor-pointer hover:text-black">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
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

            {/* Top Categories */}
            <div className="text-center lg:text-left">
              <h4 className="font-semibold text-base mb-4 text-black">
                Top Categories
              </h4>
              <ul className="space-y-2 text-gray-600">
                {topCategories.map((category) => (
                  <li
                    key={category.id}
                    className="cursor-pointer hover:text-black"
                  >
                    <Link href={`/category/${category.id}`}>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social + Contact */}
            <div className="text-center lg:text-left">
              <h4 className="font-semibold text-base mb-4 text-black">
                Social
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <span className="font-medium">Phone:</span>{" "}
                  {company?.phone || "N/A"}
                </li>
                <li>
                  <span className="font-medium">Email:</span>{" "}
                  {company?.email || "N/A"}
                </li>
                <li className="flex items-center gap-4 justify-center lg:justify-start mt-2">
                  <Link href={company?.facebook_link || "#"} target="_blank">
                    <Image
                      src={company.facebook_icon}
                      alt="Facebook"
                      width={60}
                      height={60}
                    />
                  </Link>
                  <Link href={company?.instagram_link || "#"} target="_blank">
                    <Image
                      src={company.instagram_icon}
                      alt="Instagram"
                      width={60}
                      height={60}
                    />
                  </Link>
                  <Link href={company?.twitter_link || "#"} target="_blank">
                    <Image
                      src={company.twitter_icon}
                      alt="Twitter"
                      width={60}
                      height={60}
                    />
                  </Link>
                  <Link href={company?.linkedin_link || "#"} target="_blank">
                    <Image
                      src={company.linkedin_icon}
                      alt="LinkedIn"
                      width={60}
                      height={60}
                    />
                  </Link>
                </li>
              </ul>
            </div>
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
