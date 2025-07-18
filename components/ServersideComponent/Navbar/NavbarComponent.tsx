"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import NavItems from "@/components/ClientsideComponent/Navbar/NavItems";
import SearchBar from "@/components/ClientsideComponent/Navbar/SearchBar";
import NavbarIconsWrapper from "@/components/ClientsideComponent/Navbar/NavbarIconsWrapper";
import MobileMenu from "@/components/ClientsideComponent/Navbar/MobileMenu";
import { CompanySettings } from "@/api/CompanyApi";

interface NavbarProps {
  companyDetails?: CompanySettings;
}

const Navbar = ({ companyDetails }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const logoUrl = companyDetails?.logo || "/logo1.png";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={` w-full fixed top-0  z-50 transition-all duration-300 backdrop-blur-md ${
        scrolled ? "bg-white/80 shadow" : "bg-white/80"
      }`}
    >
      <div className="max-w-7xl mx-auto w-full px-4 flex flex-col gap-4">
        {/* Desktop View */}
        <div className="hidden lg:flex items-center justify-between w-full">
          {/* Left: Nav Items */}
          <div className="flex gap-8">
            <NavItems />
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center flex-1">
            <Link href="/">
              <Image src={logoUrl} alt="Logo" width={140} height={50} />
            </Link>
          </div>

          {/* Right: Search Bar and Icons */}
          <div className="flex items-center gap-4">
            <div className="w-[180px]">
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
          <div className="flex items-center gap-4">
            <div className="w-[180px]">
              <SearchBar />
            </div>
            <NavbarIconsWrapper />
            <MobileMenu companyDetails={companyDetails} />
          </div>
        </div>

        {/* Mobile View */}
        <div className="flex flex-col md:hidden w-full">
          <div className="flex justify-between items-center w-full">
            <Link href="/">
              <Image src={logoUrl} alt="Logo" width={120} height={40} />
            </Link>
            <div className="flex items-center gap-4">
              <NavbarIconsWrapper />
              <MobileMenu companyDetails={companyDetails} />
            </div>
          </div>
          <div className="mt-2">
            <SearchBar />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
