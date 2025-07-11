"use client";

import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { getNavbarData, NavbarItem } from "@/api/NavbarApi";
import { CompanySettings } from "@/api/CompanyApi"; // Import CompanySettings
import { fetchCategories } from "@/api/fetchCategories";
import { Category } from "@/types/category";

// Define props interface for MobileMenu
interface MobileMenuProps {
  companyDetails?: CompanySettings;
}

// Accept companyDetails as a prop
const MobileMenu = ({ companyDetails }: MobileMenuProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavbarItem[]>([]);
  // No longer need to fetch logo here, use prop
  // const [logo, setLogo] = useState<string>("/logo1.png");
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [expandedCatId, setExpandedCatId] = useState<number | null>(null);
  const [expandedSubCatId, setExpandedSubCatId] = useState<number | null>(null);

  // Use the logo from companyDetails prop, or fallback
  const logo = companyDetails?.logo || "/logo1.png";

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const res = await getNavbarData();
        if (Array.isArray(res.result)) {
          setNavItems(res.result.filter((item) => item.is_active));
        }
      } catch (err) {
        console.error("Failed to load nav items in mobile menu:", err);
      }
    };

    // Remove fetchLogo here as it's now passed via props
    // const fetchLogo = async () => { /* ... */ };

    const fetchCats = async () => {
      try {
        const res = await fetchCategories();
        if (res.success && Array.isArray(res.categories)) {
          setCategories(res.categories.filter((c) => !c.isDeleted));
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchNav();
    // fetchLogo(); // Remove this line
    fetchCats();
  }, []);

  const toggleParentCategory = (catId: number) => {
    setExpandedCatId((prev) => (prev === catId ? null : catId));
    setExpandedSubCatId(null);
  };

  const toggleSubcategory = (subId: number) => {
    setExpandedSubCatId((prev) => (prev === subId ? null : subId));
  };

  const goToCategory = (
    id: number,
    type: "category" | "subcategory" | "subsubcategory"
  ) => {
    setOpen(false);
    setShowCategories(false);
    setExpandedCatId(null);
    setExpandedSubCatId(null);

    if (type === "category") router.push(`/category/${id}`);
    else if (type === "subcategory") router.push(`/subcategory/${id}`);
    else router.push(`/subsubcategory/${id}`);
  };

  return (
    <div className="relative z-50 text-[#203B67] mt-2">
      <button onClick={() => setOpen(!open)} aria-label="Toggle Menu">
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`fixed top-0 left-0 w-full h-screen bg-[#f3f6f7] z-50 transform transition-transform duration-500 ease-in-out ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="p-4 overflow-y-auto h-full">
          <div className="flex justify-between items-center">
            <Link href="/" onClick={() => setOpen(false)}>
              <Image src={logo} alt="Logo" width={120} height={40} />
            </Link>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Menu"
              className="text-gray-800"
            >
              <X size={28} />
            </button>
          </div>

          <ul className="flex flex-col gap-4 mt-6">
            {navItems.map((item: NavbarItem) => (
              <li key={item.id}>
                {item.name.toLowerCase() === "categories" ? (
                  <div>
                    <button
                      onClick={() => setShowCategories(!showCategories)}
                      className="text-black text-lg font-medium flex items-center justify-between w-full"
                    >
                      Categories
                      <ChevronDown size={18} />
                    </button>

                    {showCategories && (
                      <ul className="ml-2 mt-2 space-y-2">
                        {categories.map((cat) => (
                          <li key={cat.id}>
                            <div className="flex justify-between items-center">
                              <button
                                onClick={() => goToCategory(cat.id, "category")}
                                className="text-sm font-medium text-left text-gray-800 w-full"
                              >
                                {cat.name}
                              </button>
                              {Array.isArray(cat.subcategories) &&
                                cat.subcategories.length > 0 && (
                                  <button
                                    onClick={() => toggleParentCategory(cat.id)}
                                  >
                                    <ChevronDown
                                      size={14}
                                      className="text-gray-600"
                                    />
                                  </button>
                                )}
                            </div>

                            {expandedCatId === cat.id &&
                              Array.isArray(cat.subcategories) &&
                              cat.subcategories.length > 0 && (
                                <ul className="ml-4 mt-1 space-y-1">
                                  {cat.subcategories.map((sub) => (
                                    <li key={sub.id}>
                                      <div className="flex justify-between items-center">
                                        <button
                                          onClick={() =>
                                            goToCategory(sub.id, "subcategory")
                                          }
                                          className="text-xs font-medium text-left text-gray-700 w-full"
                                        >
                                          {sub.name}
                                        </button>
                                        {Array.isArray(sub.subsubcategories) &&
                                          sub.subsubcategories.length > 0 && (
                                            <button
                                              onClick={() =>
                                                toggleSubcategory(sub.id)
                                              }
                                            >
                                              <ChevronRight
                                                size={12}
                                                className="text-gray-500"
                                              />
                                            </button>
                                          )}
                                      </div>

                                      {expandedSubCatId === sub.id &&
                                        Array.isArray(sub.subsubcategories) &&
                                        sub.subsubcategories.length > 0 && (
                                          <ul className="ml-4 mt-1 space-y-1">
                                            {sub.subsubcategories.map(
                                              (subsub) => (
                                                <li key={subsub.id}>
                                                  <button
                                                    onClick={() =>
                                                      goToCategory(
                                                        subsub.id,
                                                        "subsubcategory"
                                                      )
                                                    }
                                                    className="text-xs text-gray-600 hover:text-blue-600 block text-left"
                                                  >
                                                    {subsub.name}
                                                  </button>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.link || "#"}
                    className="text-black text-lg font-medium hover:text-blue-600 block"
                    onClick={() => setOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
