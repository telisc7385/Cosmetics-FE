"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import NavItems from "@/components/ClientsideComponent/Navbar/NavItems";
import SearchBar from "@/components/ClientsideComponent/Navbar/SearchBar";
import NavbarIconsWrapper from "@/components/ClientsideComponent/Navbar/NavbarIconsWrapper";
import MobileMenu from "@/components/ClientsideComponent/Navbar/MobileMenu";
import { CompanySettings } from "@/api/CompanyApi";
import HomeCoupon from "@/components/ClientsideComponent/HomeCoupon/HomeCoupon"; // Ensure this path is correct

interface NavbarProps {
  companyDetails?: CompanySettings;
}

const Navbar = ({ companyDetails }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const logoUrl = companyDetails?.logo || "/logo1.png";

  // Define the approximate height of the HomeCoupon banner
  const homeCouponHeight = 40; // px, based on py-2 (16px) + text height, rounded up for safety

  useEffect(() => {
    const handleScroll = () => {
      // Adjust scroll check to account for the coupon banner
      setScrolled(window.scrollY > 10 + homeCouponHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [homeCouponHeight]);

  return (
    <>
      {/* HomeCoupon component - fixed at the very top with a higher z-index */}
      <div className="fixed top-0 left-0 w-full z-[51] mb-5">
        {" "}
        {/* Increased z-index to 51 */}
        <HomeCoupon />
      </div>

      {/* Main Navbar component - fixed below the HomeCoupon */}
      <nav
        // The 'top' property is set dynamically based on the homeCouponHeight
        className={`w-full fixed top-[${homeCouponHeight}px] z-50 transition-all duration-300 backdrop-blur-md mt-6 ${
          scrolled ? "bg-white/80 shadow" : "bg-white/80"
        }`}
      >
        <div className="max-w-7xl mx-auto w-full px-4 flex flex-col gap-6 py-2">
          {/* Desktop View */}
          <div className="hidden lg:flex items-center justify-between w-full">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Link href="/">
                <Image src={logoUrl} alt="Logo" width={140} height={50} />
              </Link>
            </div>

            {/* Center: Nav Items */}
            <div className="flex justify-center flex-1">
              <NavItems />
            </div>

            {/* Right: Search Bar and Icons (grouped together) */}
            <div className="flex items-center gap-6">
              {" "}
              {/* Use gap for spacing between search bar and icons */}
              <div className="w-[350px]">
                <SearchBar />
              </div>
              <NavbarIconsWrapper />
            </div>
          </div>

          {/* Tablet View */}
          <div className="hidden md:flex lg:hidden items-center justify-between w-full">
            <Link href="/">
              <Image src={logoUrl} alt="Logo" width={140} height={50} />
            </Link>
            <div className="flex items-center gap-6">
              <div className="w-[280px]">
                <SearchBar />
              </div>
              <NavbarIconsWrapper />
              <MobileMenu companyDetails={companyDetails} />
            </div>
          </div>

          {/* Mobile View */}
          <div className="flex flex-col md:hidden w-full">
            <div className="flex justify-between items-center w-full pb-2">
              <Link href="/">
                <Image src={logoUrl} alt="Logo" width={120} height={40} />
              </Link>
              <div className="flex items-center gap-4">
                <NavbarIconsWrapper />
                <MobileMenu companyDetails={companyDetails} />
              </div>
            </div>
            <div >
              <SearchBar />
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer div to add margin under the fixed HomeCoupon and Navbar */}
      {/* Total height = HomeCoupon height + Navbar height */}
      {/* Navbar height: ~100px for mobile, ~60px for desktop (based on original spacer) */}
      <div
        className={`h-[${homeCouponHeight + 100}px] lg:h-[${
          homeCouponHeight + 60
        }px]`}
        aria-hidden="true"
      />
    </>
  );
};

export default Navbar;
