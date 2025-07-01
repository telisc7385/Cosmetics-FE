// components/ServersideComponent/Navbar/Navbar.tsx
// NO CHANGES ARE NEEDED IN THIS FILE.
// Its current form is correct for the requirements.

import Image from "next/image";
import Link from "next/link";
import NavItems from "@/components/ClientsideComponent/Navbar/NavItems";
import SearchBar from "@/components/ClientsideComponent/Navbar/SearchBar";
import NavbarIconsWrapper from "@/components/ClientsideComponent/Navbar/NavbarIconsWrapper"; // This client component handles cart count and authentication icons
import MobileMenu from "@/components/ClientsideComponent/Navbar/MobileMenu";

const Navbar = async () => {
  return (
    <nav className="w-full bg-[#f3f6f7] shadow p-2 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-4">
        {/* 💻 Laptop View */}
        <div className="hidden lg:flex justify-between items-center w-full">
          {/* Left: Logo */}
          <Link href="/">
            <Image src="/logo1.png" alt="Logo" width={120} height={40} />
          </Link>

          {/* Center: NavItems */}
          <div className="flex justify-center flex-1">
            <NavItems />
          </div>

          {/* Right: Search + Icons */}
          <div className="flex items-center gap-4">
            <SearchBar />
            {/* The NavbarIconsWrapper component encapsulates the dynamic cart count and user icon logic */}
            <NavbarIconsWrapper />
          </div>
        </div>

        {/* 📱 Tablet View */}
        <div className="hidden md:flex lg:hidden items-center justify-between w-full">
          {/* Left: Logo */}
          <Link href="/">
            <Image src="/sitelogo.png" alt="Logo" width={120} height={40} />
          </Link>

          {/* Right: Search + Icons + Hamburger */}
          <div className="flex items-center gap-4">
            <SearchBar />
            {/* The NavbarIconsWrapper component encapsulates the dynamic cart count and user icon logic */}
            <NavbarIconsWrapper />
            <MobileMenu />
          </div>
        </div>

        {/* 📱 Mobile View */}
        <div className="flex flex-col md:hidden w-full">
          {/* Top Row: Logo left + Icons right */}
          <div className="flex justify-between items-center w-full">
            <Link href="/">
              <Image src="/sitelogo.png" alt="Logo" width={100} height={30} />
            </Link>
            <div className="flex items-center gap-4">
              {/* The NavbarIconsWrapper component encapsulates the dynamic cart count and user icon logic */}
              <NavbarIconsWrapper />
              <MobileMenu />
            </div>
          </div>

          {/* Search bar full width below */}
          <div className="mt-2">
            <SearchBar />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
