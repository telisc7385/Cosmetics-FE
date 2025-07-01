"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import NavbarIconsWrapper from "./NavbarIconsWrapper";
import Link from "next/link";
import { getNavbarData, NavbarItem } from "@/api/NavbarApi";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavbarItem[]>([]);

  useEffect(() => {
    const fetchNav = async () => {
      try {
        const res = await getNavbarData();
        if (Array.isArray(res.result)) {
          setNavItems(res.result.filter((item) => item.is_active));
        }
      } catch (err) {
        console.error("❌ Failed to load nav items in mobile menu:", err);
      }
    };

    fetchNav();
  }, []);

  return (
    <div className="relative z-50">
      <button onClick={() => setOpen(!open)} aria-label="Toggle Menu">
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white z-50 transform transition-transform duration-500 ease-in-out ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="p-4">
          <div className="flex justify-end">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close Menu"
              className="text-gray-800"
            >
              <X size={28} />
            </button>
          </div>

          <ul className="flex flex-col gap-4 mt-6">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.link || "#"}
                  className="text-black text-lg font-medium hover:text-blue-600"
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <NavbarIconsWrapper />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
