"use client";

import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { getNavbarData, NavbarItem } from "@/api/NavbarApi";
import { getCompanySettings } from "@/api/CompanyApi";
import { fetchCategories } from "@/api/fetchCategories";
import { Category } from "@/types/category";

const MobileMenu = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavbarItem[]>([]);
  const [logo, setLogo] = useState<string>("/logo1.png");
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [expandedCatId, setExpandedCatId] = useState<number | null>(null);

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

    const fetchLogo = async () => {
      try {
        const settings = await getCompanySettings();
        if (settings?.result?.[0]?.logo) {
          setLogo(settings.result[0].logo);
        }
      } catch (err) {
        console.error("Failed to load logo:", err);
      }
    };

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
    fetchLogo();
    fetchCats();
  }, []);

  const handleParentCategoryClick = (catId: number) => {
    setOpen(false);
    setShowCategories(false);
    setExpandedCatId(null);
    router.push(`/category/${catId}`);
  };

  const handleSubcategoryClick = (subId: number) => {
    setOpen(false);
    setShowCategories(false);
    setExpandedCatId(null);
    router.push(`/subcategory/${subId}`);
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
                      {showCategories ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    {showCategories && (
                      <ul className="ml-2 mt-2 space-y-2">
                        {categories.map((cat) => (
                          <li key={cat.id}>
                            <button
                              onClick={() => {
                                if (
                                  Array.isArray(cat.subcategories) &&
                                  cat.subcategories.length > 0
                                ) {
                                  setExpandedCatId((prev) =>
                                    prev === cat.id ? null : cat.id
                                  );
                                }
                                handleParentCategoryClick(cat.id);
                              }}
                              className="text-sm text-gray-800 font-medium flex justify-between w-full"
                            >
                              <span className="flex items-center gap-1">
                                {cat.name}
                                {Array.isArray(cat.subcategories) &&
                                  cat.subcategories.length > 0 && (
                                    <ChevronDown
                                      size={14}
                                      className="text-gray-600"
                                    />
                                  )}
                              </span>
                            </button>

                            {expandedCatId === cat.id &&
                              Array.isArray(cat.subcategories) &&
                              cat.subcategories.length > 0 && (
                                <ul className="ml-4 mt-1 space-y-1">
                                  {cat.subcategories.map((sub: Category) => (
                                    <li key={sub.id}>
                                      <button
                                        className="text-xs text-gray-600 hover:text-blue-600 block text-left w-full flex justify-between items-center"
                                        onClick={() =>
                                          typeof sub.id === "number" &&
                                          handleSubcategoryClick(sub.id)
                                        }
                                      >
                                        <span>{sub.name}</span>
                                        {Array.isArray(sub.subcategories) &&
                                          sub.subcategories.length > 0 && (
                                            <ChevronDown size={12} />
                                          )}
                                      </button>
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
