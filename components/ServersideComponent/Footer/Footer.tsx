import { Category } from "@/types/category";
import Image from "next/image";
import Link from "next/link";
import { CompanySettings } from "@/api/CompanyApi"; // Import CompanySettings
import { getNavbarData } from "@/api/NavbarApi"; // Keep this if Footer still needs nav items
import { FaRegEnvelope } from "react-icons/fa";
import { IoCallOutline } from "react-icons/io5";
import { NavItem } from "@/types/nav";

// Define props interface for Footer
interface FooterProps {
  topCategories: Category[];
  companyDetails?: CompanySettings; // Accept companyDetails as a prop
}

const Footer = async ({ topCategories, companyDetails }: FooterProps) => {
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
    <footer className="bg-[#F3F6F7] text-[#213C66] pt-8 pb-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 text-[15px]">
          {/* Column 1: Logo + Description */}
          <div className="lg:col-span-1 text-center lg:text-left space-y-0 -mt-5">
            <Image
              src={companyDetails?.logo || "/logo1.png"}
              alt="Site Logo"
              width={180}
              height={70}
              className="mx-auto lg:mx-0"
            />
            <p className="text-sm leading-relaxed max-w-sm mx-auto lg:mx-0">
              {companyDetails?.description ||
                "Keep it simple, keep it minimal, yet stylish. We bring timeless, modern furniture designed for elegant, everyday living."}
            </p>
          </div>

          {/* Mobile View: 2x2 Grid Layout */}
          <div className="block lg:hidden w-full">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* Menu */}
              <div className="space-y-2">
                <h4 className="font-bold text-black text-base">Menu</h4>
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <Link href={item.link}>
                        <span className="cursor-pointer hover:text-black text-sm">
                          {item.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="font-bold text-black text-base">Categories</h4>
                <ul className="space-y-1">
                  {topCategories.map((category) => (
                    <li key={category.id}>
                      <Link href="#">
                        <span className="cursor-pointer hover:text-black text-sm">
                          {category.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services */}
              <div className="space-y-2">
                <h4 className="font-bold text-black text-base">Services</h4>
                <ul className="space-y-1">
                  <li>
                    <Link href="/terms">
                      <span className="cursor-pointer hover:text-black text-sm">
                        Terms
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <span className="cursor-pointer hover:text-black text-sm">
                        Privacy Policy
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <span className="cursor-pointer hover:text-black text-sm">
                        Terms & Conditions
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Get In Touch */}
              <div className="space-y-2">
                <h4 className="font-bold text-black text-base">Get In Touch</h4>
                <div className="text-sm flex items-center gap-2">
                  <IoCallOutline className="text-base" />
                  <a href={`tel:${companyDetails?.phone || "+91180041224826"}`}>
                    {companyDetails?.phone || "+91 1800 4122 4826"}
                  </a>
                </div>
                <div className="text-sm flex items-center gap-2">
                  <FaRegEnvelope className="text-base" />
                  <a
                    href={`mailto:${
                      companyDetails?.email || "sales@mangochairs.com"
                    }`}
                  >
                    {companyDetails?.email || "sales@mangochairs.com"}
                  </a>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex justify-center items-center gap-4 mt-6">
              {companyDetails?.facebook_icon && (
                <Link
                  href={companyDetails.facebook_link || "#"}
                  target="_blank"
                >
                  <Image
                    src={companyDetails.facebook_icon}
                    alt="fb"
                    width={40}
                    height={40}
                  />
                </Link>
              )}
              {companyDetails?.instagram_icon && (
                <Link
                  href={companyDetails.instagram_link || "#"}
                  target="_blank"
                >
                  <Image
                    src={companyDetails.instagram_icon}
                    alt="ig"
                    width={40}
                    height={40}
                  />
                </Link>
              )}
              {companyDetails?.twitter_icon && (
                <Link href={companyDetails.twitter_link || "#"} target="_blank">
                  <Image
                    src={companyDetails.twitter_icon}
                    alt="tw"
                    width={40}
                    height={40}
                  />
                </Link>
              )}
              {companyDetails?.linkedin_icon && (
                <Link
                  href={companyDetails.linkedin_link || "#"}
                  target="_blank"
                >
                  <Image
                    src={companyDetails.linkedin_icon}
                    alt="li"
                    width={40}
                    height={40}
                  />
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:block">
            <h4 className="font-bold text-black mb-3 text-lg">Menu</h4>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link href={item.link || "#"}>
                    <span className="cursor-pointer hover:text-black text-md">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Categories */}
          <div className="hidden lg:block">
            <h4 className="font-bold text-black mb-3 text-lg">Categories</h4>
            <ul className="space-y-2">
              {topCategories.map((category) => (
                <li key={category.id}>
                  <Link href={`/category/${category.id}`}>
                    <span className="cursor-pointer hover:text-black text-md">
                      {category.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Services */}
          <div className="hidden lg:block">
            <h4 className="font-bold text-black mb-3 text-lg">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms">
                  <span className="cursor-pointer hover:text-black text-md">
                    Terms
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/privacypolicy">
                  <span className="cursor-pointer hover:text-black text-md">
                    Privacy Policy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/termscondition">
                  <span className="cursor-pointer hover:text-black text-md">
                    Terms and Conditions
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact + Social (Desktop) */}
          <div className="hidden lg:block">
            <h4 className="font-bold text-black mb-3 text-lg">Get In Touch</h4>
            <div className="mb-2 flex items-center gap-2 text-lg">
              <IoCallOutline />
              <a
                href={`tel:${companyDetails?.phone || "+91180041224826"}`}
                className="hover:underline"
              >
                {companyDetails?.phone || "+91 1800 4122 4826"}
              </a>
            </div>
            <div className="mb-4 flex items-center gap-2 text-lg">
              <FaRegEnvelope />
              <a
                href={`mailto:${
                  companyDetails?.email || "sales@mangochairs.com"
                }`}
                className="hover:underline"
              >
                {companyDetails?.email || "sales@mangochairs.com"}
              </a>
            </div>
            <div className="flex gap-4 text-[#213C66] text-lg -mt-2">
              {companyDetails?.facebook_icon && (
                <Link
                  href={companyDetails.facebook_link || "#"}
                  target="_blank"
                >
                  <Image
                    src={companyDetails.facebook_icon}
                    alt="fb"
                    width={60}
                    height={60}
                  />
                </Link>
              )}
              {companyDetails?.instagram_icon && (
                <Link
                  href={companyDetails.instagram_link || "#"}
                  target="_blank"
                >
                  <Image
                    src={companyDetails.instagram_icon}
                    alt="ig"
                    width={60}
                    height={60}
                  />
                </Link>
              )}
              {companyDetails?.twitter_icon && (
                <Link href={companyDetails.twitter_link || "#"} target="_blank">
                  <Image
                    src={companyDetails.twitter_icon}
                    alt="tw"
                    width={60}
                    height={60}
                  />
                </Link>
              )}
              {companyDetails?.linkedin_icon && (
                <Link
                  href={companyDetails.linkedin_link || "#"}
                  target="_blank"
                >
                  <Image
                    src={companyDetails.linkedin_icon}
                    alt="li"
                    width={60}
                    height={60}
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#213c66] text-white text-sm text-center py-3 w-full mt-10">
        © 2025 Glam Cosmetics. All rights reserved. Powered by{" "}
        <Link
          href="https://consociatesolutions.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="font-semibold">Consociate Solutions</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
