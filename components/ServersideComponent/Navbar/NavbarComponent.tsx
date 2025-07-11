import Image from "next/image";
import Link from "next/link";
import NavItems from "@/components/ClientsideComponent/Navbar/NavItems";
import SearchBar from "@/components/ClientsideComponent/Navbar/SearchBar";
import NavbarIconsWrapper from "@/components/ClientsideComponent/Navbar/NavbarIconsWrapper";
import MobileMenu from "@/components/ClientsideComponent/Navbar/MobileMenu";
import { CompanySettings } from "@/api/CompanyApi"; // Import CompanySettings

// Define props interface for Navbar
interface NavbarProps {
  companyDetails?: CompanySettings;
}

// Accept companyDetails as a prop
const Navbar = async ({ companyDetails }: NavbarProps) => {
  const logoUrl = companyDetails?.logo || "/logo1.png";

  return (
    <nav className="w-full bg-[#f3f6f7] shadow p-2 sticky top-0 z-50 px-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-4">
        {/* Desktop View */}
        <div className="hidden lg:flex justify-between items-center w-full">
          <Link href="/">
            <Image src={logoUrl} alt="Logo" width={120} height={40} />
          </Link>
          <div className="flex justify-center flex-1">
            {/* NavItems does not directly use logo, but it can be passed if needed for other company info */}
            <NavItems />
          </div>
          <div className="flex items-center gap-4">
            <SearchBar />
            <NavbarIconsWrapper />
          </div>
        </div>

        {/* Tablet View */}
        <div className="hidden md:flex lg:hidden items-center justify-between w-full">
          <Link href="/">
            <Image src={logoUrl} alt="Logo" width={120} height={40} />
          </Link>
          <div className="flex items-center gap-4">
            <SearchBar />
            <NavbarIconsWrapper />
            {/* Pass companyDetails to MobileMenu */}
            <MobileMenu companyDetails={companyDetails} />
          </div>
        </div>

        {/* Mobile View */}
        <div className="flex flex-col md:hidden w-full">
          <div className="flex justify-between items-center w-full">
            <Link href="/">
              <Image src={logoUrl} alt="Logo" width={100} height={30} />
            </Link>
            <div className="flex items-center gap-4">
              <NavbarIconsWrapper />
              {/* Pass companyDetails to MobileMenu */}
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
