"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getNavbarData } from "@/api/NavbarApi";
import { fetchCategories } from "@/api/fetchCategories";
import { NavItem } from "@/types/nav";
import { Category } from "@/types/category";
import { ChevronDown, ChevronRight } from "lucide-react";

const NavItems = () => {
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const navResponse = await getNavbarData();
        if (Array.isArray(navResponse.result)) {
          setNavItems(navResponse.result);
        }

        const catResponse = await fetchCategories();
        if (catResponse.success && Array.isArray(catResponse.categories)) {
          setCategories(catResponse.categories.filter((c) => !c.isDeleted));
        }
      } catch (error) {
        console.error("Navbar or Categories fetch failed:", error);
      }
    };

    fetchData();
  }, []);

  const hasAnySub = categories.some(
    (cat) => Array.isArray(cat.subcategories) && cat.subcategories.length > 0
  );

  return (
    <ul className="flex gap-10">
      {navItems.map((item) =>
        item.is_active ? (
          item.name.toLowerCase() === "categories" ? (
            <li
              key={item.id}
              className="relative group flex items-center gap-1"
            >
              <span
                className={`text-black hover:text-[#213E5A] flex items-center gap-1 ${
                  pathname.startsWith("/category") ? "underline" : ""
                }`}
              >
                {item.name}
                {hasAnySub && <ChevronDown size={14} />}
              </span>

              {/* Subcategories Dropdown */}
              <ul className="absolute top-full left-0 mt-2 text-black bg-white border border-gray-300 rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50 min-w-[220px]">
                {categories.map((cat) => (
                  <li key={cat.id} className="relative group/subcat">
                    <Link href={`/category/${cat.id}`}>
                      <span className="block px-4 py-2 text-black hover:bg-[#edf3f8] flex items-center gap-1">
                        {cat.name}
                        {Array.isArray(cat.subcategories) &&
                          cat.subcategories.length > 0 && (
                            <ChevronRight size={12} />
                          )}
                      </span>
                    </Link>

                    {/* Sub-subcategories Dropdown */}
                    {Array.isArray(cat.subcategories) &&
                      cat.subcategories.length > 0 && (
                        <ul className="absolute top-0 left-full mt-0 ml-1 bg-white border border-gray-300 rounded shadow-lg opacity-0 group-hover/subcat:opacity-100 invisible group-hover/subcat:visible transition-all duration-200 min-w-[220px] z-50">
                          {cat.subcategories.map((sub) => (
                            <li key={sub.id} className="relative group/subsub">
                              <Link href={`/subcategory/${sub.id}`}>
                                <span className="block px-4 py-2 text-black hover:bg-[#edf3f8] flex items-center gap-1 text-sm">
                                  {sub.name}
                                  {(sub.subsubcategories?.length ?? 0) > 0 && (
                                    <ChevronRight size={12} />
                                  )}
                                </span>
                              </Link>

                              {(sub.subsubcategories?.length ?? 0) > 0 && (
                                <ul className="absolute top-0 left-full mt-0 ml-1 bg-white border border-gray-300 rounded shadow-lg opacity-0 group-hover/subsub:opacity-100 invisible group-hover/subsub:visible transition-all duration-200 min-w-[200px] z-50">
                                  {(sub.subsubcategories ?? []).map(
                                    (subsub) => (
                                      <li key={subsub.id}>
                                        <Link
                                          href={`/subsubcategory/${subsub.id}`}
                                        >
                                          <span className="block px-4 py-2 hover:bg-[#edf3f8] text-sm">
                                            {subsub.name}
                                          </span>
                                        </Link>
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
            </li>
          ) : (
            <li key={item.id}>
              <Link href={item.link || "#"}>
                <span
                  className={`text-black hover:text-blue-600 ${
                    pathname === item.link ? "underline" : ""
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          )
        ) : null
      )}
    </ul>
  );
};

export default NavItems;
