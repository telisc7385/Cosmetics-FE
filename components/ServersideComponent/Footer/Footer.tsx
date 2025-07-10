import { Category } from "@/types/category";
import Image from "next/image";
import Link from "next/link"; // Ensure Link is imported
import { getCompanySettings } from "@/api/CompanyApi";
import { getNavbarData } from "@/api/NavbarApi";
import { NavItem } from "@/types/nav";

const Footer = async ({ topCategories }: { topCategories: Category[] }) => {
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
    <footer className="bg-[#F3F6F7] text-[#213C66] pt-12 pb-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 text-[15px]">
          {/* Column 1: Logo + Description */}
          <div className="lg:col-span-1 text-center lg:text-left space-y-0 -mt-3">
            <Image
              src={company?.logo || "/logo1.png"}
              alt="Site Logo"
              width={180}
              height={70}
              className="mx-auto lg:mx-0"
            />
            <p className="text-sm leading-relaxed max-w-sm mx-auto lg:mx-0">
              {company?.description ||
                "Keep it simple, keep it minimal, yet stylish. We bring timeless, modern furniture designed for elegant, everyday living."}
            </p>
          </div>

          {/* Menu + Categories grid for mobile and tablet views */}
          <div className="block lg:hidden w-full">
            <div className="grid grid-cols-2 gap-6">
              {/* Menu (Mobile/Tablet) */}
              <div>
                <h4 className="font-bold text-black mb-3 text-lg">Menu</h4>
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      {/* For mobile and tablet, links under Menu show # */}
                      <Link href="#">
                        <span className="cursor-pointer hover:text-black text-md">
                          {item.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Services under Menu in mobile/tablet */}
                <div className="mt-6">
                  <h4 className="font-bold text-black mb-3 text-lg">
                    Services
                  </h4>
                  <ul className="space-y-2">
                    {/* Link for "Terms" page - remains unchanged */}
                    <li>
                      <Link href="/terms">
                        <span className="cursor-pointer hover:text-black text-md">
                          Terms
                        </span>
                      </Link>
                    </li>
                    {/* Other service options with '#' links for mobile/tablet */}
                    <li>
                      <Link href="#">
                        {" "}
                        {/* Changed to # */}
                        <span className="cursor-pointer hover:text-black text-md">
                          Privacy Policy
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#">
                        {" "}
                        {/* Changed to # */}
                        <span className="cursor-pointer hover:text-black text-md">
                          Terms & Conditions
                        </span>
                      </Link>
                    </li>
                    {/* Removed Help option for mobile and tablet view */}
                    {/* <li className="cursor-pointer hover:text-black text-md">
                      Help
                    </li> */}
                  </ul>
                </div>
              </div>

              {/* Categories (Mobile/Tablet) */}
              <div>
                <h4 className="font-bold text-black mb-3 text-lg">
                  Categories
                </h4>
                <ul className="space-y-2">
                  {topCategories.map((category) => (
                    <li key={category.id}>
                      {/* For mobile and tablet, links under Categories show # */}
                      <Link href="#">
                        <span className="cursor-pointer hover:text-black text-md">
                          {category.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
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
              {/* Link for "Terms" page */}
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
                {" "}
                {/* Wrapped in li */}
                <Link href="/termscondition">
                  <span className="cursor-pointer hover:text-black text-md">
                    Terms and Conditions
                  </span>
                </Link>
              </li>
              {/* Help option is retained for desktop view */}
              {/* <li className="cursor-pointer hover:text-black text-md">Help</li> */}
            </ul>
          </div>

          {/* Contact + Social */}
          <div>
            <h4 className="font-bold text-black mb-3 text-lg">Get In Touch</h4>
            <div className="mb-2 flex items-start gap-2 text-lg">
              <span>📞</span>
              <a
                href={`tel:${company?.phone || "+91180041224826"}`}
                className="hover:underline"
              >
                {company?.phone || "+91 1800 4122 4826"}
              </a>
            </div>
            <div className="mb-4 flex items-start gap-2 text-lg">
              <span>✉️</span>
              <a
                href={`mailto:${company?.email || "sales@mangochairs.com"}`}
                className="hover:underline"
              >
                {company?.email || "sales@mangochairs.com"}
              </a>
            </div>

            <div className="flex gap-4 text-[#213C66] text-lg -mt-2">
              {company?.facebook_icon && (
                <Link href={company.facebook_link || "#"} target="_blank">
                  <Image
                    src={company.facebook_icon}
                    alt="fb"
                    width={60}
                    height={60}
                  />
                </Link>
              )}
              {company?.instagram_icon && (
                <Link href={company.instagram_link || "#"} target="_blank">
                  <Image
                    src={company.instagram_icon}
                    alt="ig"
                    width={60}
                    height={60}
                  />
                </Link>
              )}
              {company?.twitter_icon && (
                <Link href={company.twitter_link || "#"} target="_blank">
                  <Image
                    src={company.twitter_icon}
                    alt="tw"
                    width={60}
                    height={60}
                  />
                </Link>
              )}
              {company?.linkedin_icon && (
                <Link href={company.linkedin_link || "#"} target="_blank">
                  <Image
                    src={company.linkedin_icon}
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
